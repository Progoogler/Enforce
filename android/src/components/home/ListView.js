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
import RNFS from 'react-native-fs';
import Row from './Row';
import insertionSortModified from './insertionSort';
import Database from '../../../../includes/firebase/database'; // Import single method { removeTicketPath }.

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

  render() {
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
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  async _checkReset() {
    let time = await AsyncStorage.getItem('@Enforce:timeOfFirstPicture');
    if (isNaN(parseInt(time))) return;
    if (new Date() - parseInt(time) > 28800000) { // Reset DB after 8 hours of activity 28800000
      this._reset();
    }
  }

  async _reset() {
    let userId = await AsyncStorage.getItem('@Enforce:profileId');
    let profileSettings = await AsyncStorage.getItem('@Enforce:profileSettings');
    profileSettings = JSON.parse(profileSettings);
    let refPath = `${profileSettings.county}/${userId}`;
    let dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}`;

    if (dateCount === null) { // Initialize the dateCount.
      dateCount = [];
    } else {
      dateCount = await JSON.parse(dateCount);
      if (dateCount.length >= 45) {
        let removalDate = dateCount.shift();
        Database.removeTicketPath(refPath, removalDate);
      }
    }
    dateCount.push(date);
    dateCount = await JSON.stringify(dateCount);
    AsyncStorage.setItem('@Enforce:dateCount', dateCount);

    let timerLists = this.realm.objects('Timers');
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.
      let i = 0, lastTime;
      while (lastTime === undefined && i < timerLists.length) { // Edge case for empty first object.
        // Get the earliest value from any list starting from ticket list.
        if (ticketList[0].list.length > i && !lastTime) {
          lastTime = ticketList[0].list[i].createdAt;
          break;
        }
        if (expiredList[0].list.length > i && !lastTime) {
          lastTime = expiredList[0].list[i].createdAt;
          break;
        }
        if (timerLists[i].list.length > 0 && !lastTime) {
          lastTime = timerLists[i].list[0].createdAt;
          break;
        }
        i++;
      }
      console.log('starting reset')
      this._loopDeletion(timerLists);
      if (ticketList[0].list.length > 0) this._loopDeletion(ticketList, true);
      if (expiredList[0].list.length > 0) this._loopDeletion(expiredList, true);
      //TODO Doesn't wait..
      AsyncStorage.setItem('@Enforce:timeOfFirstPicture', 'null');
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
        RNFS.unlink(timer.mediaPath)
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
          RNFS.unlink(timer.mediaPath)
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
      RNFS.unlink(timer.mediaPath)
      .then(() => {
        console.log('FILE DELETED');
        RNFS.exists(timer.mediaUri)
        .then(() => {
          console.log('PICTURE REMOVED');
          this.realm.write(() => {
            // sidx?
            this.realm.delete(timer[idx]['list'][sidx]);
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
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false, updateRows: this.state.updateRows = this.state.updateRows + 1, updatedLocation: null});
  }
}

export default TimersList;
