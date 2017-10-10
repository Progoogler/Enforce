import React, { Component } from 'react';
import {
  AsyncStorage,
  DeviceEventEmitter,
  StyleSheet,
  View,
} from 'react-native';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import PropTypes from 'prop-types';
import Realm from 'realm';
import Schema from '../../db/realm';
import { unlink } from 'react-native-fs';

import insertionSortModified from './insertionSort';
import { removeTicketPath } from '../../../../includes/firebase/database';
import Row from './Row';


export default class TimersList extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.list = insertionSortModified(this.realm.objects('Timers').filtered('list.createdAt > 0'));
    this.state = {
      dataSource: this.list,
      refreshing: false,
      updateRows: 0,
      updatedLocation: false,
    };
    this.key = 0;
    this.mounted = false;
    this.refreshed = 0;
    this.timeoutRefresh = null;
  }

  render() {
    return (
      <FlatList
        style={styles.flatlist}
        data={this.state.dataSource}
        ItemSeparatorComponent={this._renderSeparator}
        onRefresh={this._onRefresh.bind(this)}
        refreshing={this.state.refreshing}
        renderItem={this._renderItem.bind(this)}
        keyExtractor={this._keyExtractor.bind(this)} 
      />
    );
  }

  componentDidMount() {
    this.mounted = true;
    this._checkReset();
    this._getAndSaveCoords();
    this._setTimeoutRefresh();
  }

  componentDidUpdate(prevProps) { // In case reset is pushed while in Overview screen
    if (prevProps.navigation.state !== this.props.navigation.state) {
      if (this.props.navigation.state.params && this.props.navigation.state.params.reset) {
        this._hardReset();
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutRefresh);
    this.mounted = false;
  }

  _setTimeoutRefresh() {
    var now = new Date();
    for (let i = 0; i < this.list.length; i++) {
      if (now - this.list[i].list[0].createdAt < this.list[i].list[0].timeLength * 60 * 60 * 1000) {
        this.timeoutRefresh = setTimeout(() => {
          this._onRefresh();
          this._setTimeoutRefresh();
        }, (this.list[i].list[0].timeLength * 60 * 60 * 1000) - (now - this.list[i].list[0].createdAt));
        return;
      }
    }
  }

  async _checkReset() {
    var today = new Date().getDate();
    var yesterday = await AsyncStorage.getItem('@Enforce:currentDay');
    if (!yesterday) AsyncStorage.setItem('@Enforce:currentDay', `${today}`);
    // If today is a different day than yesterday, reset app; i.e., 24th > 23rd || 2nd - 24th < 0
    if (today > parseInt(yesterday) || today - parseInt(yesterday) < 0) {
      this._reset();
      DeviceEventEmitter.removeListener('notificationActionReceived');
    } else if (this.props.navigation.state.params && this.props.navigation.state.params.reset) {
      this._hardReset();
      DeviceEventEmitter.removeListener('notificationActionReceived');
    }
  }

  async _reset() {
    var refPath = await AsyncStorage.getItem('@Enforce:refPath');
    var dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    var registerDate = await AsyncStorage.getItem('@Enforce:registerDate');
    var today = new Date();
    var day = today.getDate() + '';
    var date = `${today.getMonth() + 1}-${day}`;
    AsyncStorage.setItem('@Enforce:registerDate', date); // Set for next reset
    AsyncStorage.setItem('@Enforce:currentDay', day); // Set for checkReset()

    if (dateCount === null) { // Initialize the dateCount for very first instance.
      dateCount = [];
    } else {
      dateCount = JSON.parse(dateCount);
      if (dateCount.length >= 45) { // Keep at a maxium range of 45 days of history available to search
        let removalDate = dateCount.shift();
        refPath && removeTicketPath(refPath, removalDate); // Delete path from Firebase.
      }
    }
    registerDate && dateCount.push(registerDate); // Add the previous date to the History list
    dateCount = JSON.stringify(dateCount);
    AsyncStorage.setItem('@Enforce:dateCount', dateCount);

    if (this.realm.objects('Timers').length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.

      // Delete corresponding images in the DCIM directory
      this._loopDeletion(this.realm.objects('Timers'));
      if (this.realm.objects('Ticketed')[0].list.length > 0) this._loopDeletion(this.realm.objects('Ticketed'), true);
      if (this.realm.objects('Expired')[0].list.length > 0) this._loopDeletion(this.realm.objects('Expired'), true);

      var dataSource = [{list: [{'createdAt': 0}]}]; // Supply a default object to render empty ScrollView
      this.mounted && this.setState({dataSource});
      this.props.resetTicketCounter();
      setTimeout(() => {
        Realm.clearTestState();
        this.realm = new Realm({schema: Schema});
        this.realm.write(() => {
          this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1, count: 0});
          this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
          this.realm.create('Coordinates', {latitude: 0, longitude: 0, time: 0});
          this.realm.create('Ticketed', {list: []});
          this.realm.create('Expired', {list: []});
        });
      }, 3000);
      DeviceEventEmitter.removeAllListeners('notificationActionReceived');
    }
  }

  _loopDeletion(timerLists: object, once?: boolean) {
    if (once) { // Single loop for linear list
      timerLists[0].list.forEach((timer) => {
        unlink(timer.mediaPath)
        .then(() => {
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
            this.realm.write(() => {
              this.realm.delete(timer);
            });
          });
        });
      });
    }
  }

  _hardReset() { // Only removes current pictures and resets Realm state
    if (this.realm.objects('Timers').length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.

      // Delete corresponding images in the DCIM directory
      this._loopDeletion(this.realm.objects('Timers'));
      if (this.realm.objects('Ticketed')[0].list.length > 0) this._loopDeletion(this.realm.objects('Ticketed'), true);
      if (this.realm.objects('Expired')[0].list.length > 0) this._loopDeletion(this.realm.objects('Expired'), true);

      var dataSource = [{list: [{'createdAt': 0}]}]; // Supply a default object to render empty ScrollView
      this.mounted && this.setState({dataSource});
      this.props.resetTicketCounter();
      this.props.navigation.state.params = undefined;
      setTimeout(() => {
        Realm.clearTestState();
        this.realm = new Realm({schema: Schema});
        this.realm.write(() => {
          this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1, count: 0});
          this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
          this.realm.create('Coordinates', {latitude: 0, longitude: 0, time: 0});
          this.realm.create('Ticketed', {list: []});
          this.realm.create('Expired', {list: []});
        });
      }, 3000);
      DeviceEventEmitter.removeAllListeners('notificationActionReceived');
    }
  }

  deleteRow(timers: object): undefined {
    this.setState({ refreshing: true });

    timers.forEach((timer) => {
      unlink(timer.mediaPath)
      .then(() => {
        this.realm.write(() => {
          this.realm.delete(timer);
        });
      });
    });

    setTimeout(() => {
      this.realm.write(() => {
        this.realm.delete(timers);
      });
      this._onRefresh();
    }, 2000);
  }

  _getAndSaveCoords() {
    if (new Date() - this.realm.objects('Coordinates')[0].time > 300000) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.latitude = parseFloat(position.coords.latitude);
          this.longitude = parseFloat(position.coords.longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = this.latitude;
            this.realm.objects('Coordinates')[0].longitude = this.longitude;
            this.realm.objects('Coordinates')[0].time = new Date() / 1;
          });
          this.mounted && this.setState({ updatedLocation: true }) && this._onRefresh();
        }, () => {},
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    }
  }

  _onRefresh() {
    this.refreshed++;
    if (this.refreshed >= 2 && this.refreshed < 4) this.list = insertionSortModified(this.realm.objects('Timers').filtered('list.createdAt > 0'));
    this.mounted && this.setState({
      refreshing: true,
      dataSource: this.list,
      updateRows: this.state.updateRows + 1,
      updatedLocation: false,
    });
    setTimeout(() => { this.mounted && this.setState({refreshing: false})}, 1500);
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

  _keyExtractor(item): number {
    return this.key++;
  }

}

TimersList.propTypes = {
  resetTicketCounter: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  flatlist: {
    alignSelf: 'stretch',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});
