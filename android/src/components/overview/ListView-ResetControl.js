import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  AsyncStorage,
} from 'react-native';
import PropTypes from 'prop-types';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import Realm from 'realm';
import Row from './Row';
import Schema from '../../realm';
import insertionSortModified from './insertionSort';
import { unlink } from 'react-native-fs';
import { removeTicketPath } from '../../../../includes/firebase/database';


export default class TimersList extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
    this.list = insertionSortModified(this.list);
    this.state = {
      dataSource: this.list,
      updatedLocation: false,
      refreshing: false,
      updateRows: 0,
    };
  }

  render() {
    if (this.list.length < 1) {
      return <View />
    }

    return (
      <FlatList
        style={styles.flatlist}
        data={this.state.dataSource}
        ItemSeparatorComponent={this._renderSeparator}
        onRefresh={this._onRefresh.bind(this)}
        refreshing={this.state.refreshing}
        renderItem={this._renderItem.bind(this)}
        keyExtractor={this._keyExtractor} />
    );
  }

  componentWillMount() {
    this.latitude = this.realm.objects('Coordinates')[0].latitude;
    this.longitude = this.realm.objects('Coordinates')[0].longitude;
    navigator.geolocation.getCurrentPosition(
      position => { //console.log(this.realm.where(Coordinates.class).findFirst());
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
        refPath && removeTicketPath(refPath, removalDate); // Delete path from Firebase.
      }
    }
    registerDate && dateCount.push(registerDate); // Add the previous date to the History list
    dateCount = JSON.stringify(dateCount);
    AsyncStorage.setItem('@Enforce:dateCount', dateCount);

    let timerLists = this.realm.objects('Timers');
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.
      this._loopDeletion(timerLists);
      if (ticketList[0].list.length > 0) this._loopDeletion(ticketList, true);
      if (expiredList[0].list.length > 0) this._loopDeletion(expiredList, true);

      this.list = [{list: [{'createdAt': 0}]}];
      this.props.resetTicketCounter();
      this._mounted && this.setState({dataSource: this.list});
      setTimeout(() => {
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

  _loopDeletion(timerLists: object, once?: boolean) {
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

  deleteRow(timers: object): undefined {
    this.setState({ refreshing: true });

    timers.forEach((timer) => {
      unlink(timer.mediaPath)
      .then(() => {
        console.log('PICTURE REMOVED');
        this.realm.write(() => {
          this.realm.delete(timer);
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
      dataSource: this.list,
    });
    this._mounted && this.setState({refreshing: false, updateRows: this.state.updateRows + 1, updatedLocation: false});
    clearTimeout(this._timeoutRefresh);
    this._timeoutRefresh = setTimeout(() => this._onRefresh(), 300000);
  }

  _renderItem(data: object = {list: [{'createdAt': 0}]}): object { // Supplement a fake createdAt prop for FlatList Key && Row render based on empty value.
    return (
      <Row
        data={data.item}
        navigation={this.props.navigation}
        deleteRow={this.deleteRow.bind(this)}
        latitude={this.latitude}
        longitude={this.longitude}
        updateRows={this.state.updateRows}
        updatedLocation={this.state.updatedLocation} />
    );
  }

  _renderSeparator() {
    return <View style={styles.separator} />;
  }

  _keyExtractor(item: object = {list: [{'createdAt': 0}]}): number {
    return item.list[0].createdAt;
  }

}

TimersList.propTypes = {
  resetTicketCounter: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  flatlist: {
    alignSelf: 'stretch',
    marginTop: 25,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});
