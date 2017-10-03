import React, { Component } from 'react';
import {
  AsyncStorage,
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
      this.state = {
        dataSource: this.list,
        refreshing: false,
        updateRows: 0,
        updatedLocation: false,
      };
    this.realm = new Realm();
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
    this.list = insertionSortModified(this.list);
    this.key = 0;
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
        keyExtractor={this._keyExtractor.bind(this)} />
    );
  }

  componentWillMount() {
    this.latitude = this.realm.objects('Coordinates')[0].latitude;
    this.longitude = this.realm.objects('Coordinates')[0].longitude;
    navigator.geolocation.getCurrentPosition(
      position => {
        this.latitude = parseFloat(position.coords.latitude);
        this.longitude = parseFloat(position.coords.longitude);
        this.realm.write(() => {
          this.realm.objects('Coordinates')[0].latitude = this.latitude;
          this.realm.objects('Coordinates')[0].longitude = this.longitude;
        });
        this._mounted && this.setState({ updatedLocation: true }) && this._onRefresh();
      }, () => {},
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
    );
  }

  componentDidMount() {
    this._checkReset();
    this._mounted = true;
    this._timeoutRefresh = this.list.length > 0 ? setTimeout(() => this._onRefresh(), 300000) : null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.navigation.state !== this.props.navigation.state) {
      if (this.props.navigation.state.params && this.props.navigation.state.params.reset) {
        this._hardReset();
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timeoutRefresh);
    this._mounted = false;
  }

  async _checkReset() {
    let today = new Date().getDate();
    let yesterday = await AsyncStorage.getItem('@Enforce:currentDay');
    if (!yesterday) AsyncStorage.setItem('@Enforce:currentDay', `${today}`);
    // If today is a different day than yesterday, reset app; i.e., 24th > 23rd || 2nd - 24th < 0
    if (today > parseInt(yesterday) || today - parseInt(yesterday) < 0) {
      this._reset();
    } else if (this.props.navigation.state.params && this.props.navigation.state.params.reset) {
      this._hardReset();
      this.props.navigation.state.params = undefined;
    }
  }

  async _reset() {
    let refPath = await AsyncStorage.getItem('@Enforce:refPath');
    let dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    let registerDate = await AsyncStorage.getItem('@Enforce:registerDate');
    let today = new Date();
    let day = today.getDate() + '';
    let date = `${today.getMonth() + 1}-${day}`;
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

    let timerLists = this.realm.objects('Timers');
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.

      // Delete corresponding images in the DCIM directory
      this._loopDeletion(timerLists);
      if (ticketList[0].list.length > 0) this._loopDeletion(ticketList, true);
      if (expiredList[0].list.length > 0) this._loopDeletion(expiredList, true);

      this.list = [{list: [{'createdAt': 0}]}]; // Supply a default object to render empty ScrollView
      this._mounted && this.setState({dataSource: this.list});
      this.props.resetTicketCounter();
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
    let timerLists = this.realm.objects('Timers');
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object.

      // Delete corresponding images in the DCIM directory
      this._loopDeletion(timerLists);
      if (ticketList[0].list.length > 0) this._loopDeletion(ticketList, true);
      if (expiredList[0].list.length > 0) this._loopDeletion(expiredList, true);

      this.list = [{list: [{'createdAt': 0}]}]; // Supply a default object to render empty ScrollView
      this._mounted && this.setState({dataSource: this.list});
      this.props.resetTicketCounter();
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

    for (let timerObj in this.list) {
      if (this.list[timerObj].list === timers) {
        // Reassign the list property to empty object to nullify its reference
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
