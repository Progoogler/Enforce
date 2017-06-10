import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
  AsyncStorage,
} from 'react-native';
import realm from 'realm';
import Schema from '../../realm';
import { unlink, exists } from 'react-native-fs';
import Row from './Row';
import insertionSortModified from './insertionSort';
import { removeTicketPath } from '../../../../includes/firebase/database';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginTop: 25,
  },
});

class TimersList extends Component {
  constructor() {
    super();
    console.log('timer list constructor')
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.realm = new Realm();
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
    this.list = insertionSortModified(this.list);
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      updatedLocation: false,
      refreshing: false,
      updateRows: 0,
    };
  }

  render() { console.log('Listview renders')
    return (
      <ListView
        enableEmptySections={true}
        // In next release empty section headers will be rendered.
        // Until then, leave this property alone to mitigate the warning msg.
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing}
            onRefresh={() => { this._onRefresh()}} />
        }
        timers={this.list}
        style={styles.container}
        dataSource={this.state.dataSource}
        renderRow={(data) => <Row {...data}
                              navigation={this.props.navigation}
                              deleteRow={this.deleteRow.bind(this)}
                              latitude={this.latitude}
                              longitude={this.longitude}
                              updateRows={this.state.updateRows}
                              updatedLocation={this.state.updatedLocation} />}
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
      />
    );
  }

  componentWillMount() {
    this.latitude = this.realm.objects('Coordinates')[0].latitude;
    this.longitude = this.realm.objects('Coordinates')[0].longitude;
    if (this.props.renderedOnce) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.latitude = parseFloat(position.coords.latitude);
          this.longitude = parseFloat(position.coords.longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = this.latitude;
            this.realm.objects('Coordinates')[0].longitude = this.longitude;
          });
          this._mounted && this.setState({ updatedLocation: true }) && this._onRefresh();
        }, error => {
          console.log('Error loading geolocation:', error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
      this.props.toggleRendered();
    }
  }

  componentDidMount() {
    this._checkReset();
    this._mounted = true;
    this._timeoutRefresh = setTimeout(() => this._onRefresh(), 300000);
  }

  componentWillUnmount() {
    clearTimeout(this._timeoutRefresh);
    this._mounted = false;
  }

  async _checkReset() {
    let today = new Date().getDate();
    let yesterday = await AsyncStorage.getItem('@Enforce:currentDay');
    if (today > parseInt(yesterday) || today - parseInt(yesterday) < 0) {
      this._reset();
    }
  }

  async _reset() { console.log('RESET')
    let refPath = await AsyncStorage.getItem('@Enforce:refPath');
    let dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    let registerDate = await AsyncStorage.getItem('@Enforce:registerDate');
    let today = new Date();
    let day = today.getDate() + '';
    let date = `${today.getMonth() + 1}-${day}`;
    AsyncStorage.setItem('@Enforce:registerDate', date); // Set for next reset
    AsyncStorage.setItem('@Enforce:currentDay', day); // Set for checkReset()

    if (dateCount === null) { // Initialize the dateCount for first instance.
      dateCount = [];
    } else {
      dateCount = JSON.parse(dateCount);
      if (dateCount.length >= 45) {
        let removalDate = dateCount.shift();
        removeTicketPath(refPath, removalDate); // Delete path from Firebase.
      }
    }
    dateCount.push(registerDate); // Add the previous date to the History list
    dateCount = JSON.stringify(dateCount);
    AsyncStorage.setItem('@Enforce:dateCount', dateCount);

    let timerLists = this.realm.objects('Timers');
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.
      console.log('starting reset')
      this._loopDeletion(timerLists);
      if (ticketList[0].list.length > 0) this._loopDeletion(ticketList, true);
      if (expiredList[0].list.length > 0) this._loopDeletion(expiredList, true);

      this.list = [];
      this.props.updateTicketCount();
      this.setState({dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)});
      setTimeout(() => {
        console.log('NEW REALM')
        Realm.clearTestState();
        this.realm = new Realm({schema: Schema});
        this.realm.write(() => {
          this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1, count: 0});
          this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
          this.realm.create('Coordinates', {latitude: 0, longitude: 0});
          this.realm.create('Ticketed', {list: []});
          this.realm.create('Expired', {list: []});
        });
      }, 3000);
    }
  }

  _loopDeletion(timerLists, once) {
    if (once) {
      timerLists[0].list.forEach((timer) => {
        unlink(timer.mediaPath)
        .then(() => {
          console.log('FILE DELETED');
            this.realm.write(() => {
              this.realm.delete(timer);
            });
          });
        });
    } else {
      timerLists.forEach((timerList) => {
        timerList.list.forEach((timer) => {
          unlink(timer.mediaPath)
          .then(() => {
            console.log('FILE DELETED');

            this.realm.write(() => {
              this.realm.delete(timer);
            });
          });
        });
      });
    }
  }

  deleteRow(timers) {
    console.log('DEL' ,timers)

    timers.forEach((timer, idx) => {
      unlink(timer.mediaPath)
      .then(() => {
        console.log('FILE DELETED');
        exists(timer.mediaUri)                                                   // TODO potentially remove -- may not be necessary
        .then(() => {
          console.log('PICTURE REMOVED');
          this.realm.write(() => {
            this.realm.delete(timer);
          });
        });
      });
    });

    for (let timerObj in this.list) {
      if (this.list[timerObj].list === timers) {
        this.list[timerObj].list = {};
      }
    }

    setTimeout(() => {
      this.realm.write(() => {
        this.realm.delete(timers);
      });
      this._onRefresh();
    }, 2000);
  }

  _onRefresh() {
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
    this.list = insertionSortModified(this.list);
    this._mounted && this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this._mounted && this.setState({refreshing: false, updateRows: this.state.updateRows = this.state.updateRows + 1, updatedLocation: null});
    clearTimeout(this._timeoutRefresh);
    this._timeoutRefresh = setTimeout(() => this._onRefresh(), 300000);
  }
}

export default TimersList;
