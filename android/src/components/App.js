import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import RNFS from 'react-native-fs';
import { CameraApp } from './camera/CameraApp';
import MapApp from './map/MapApp';
import Home from './home';
import Profile from './profile';
import TimerList from './timerList';
import VINSearch from './search';
import History from './history';
import Metrics from './metrics';
import FAQs from './faq';
import Realm from 'realm';
import Schema from '../realm';
import Firebase from '../../../includes/firebase/firebase';

import Firestack from 'react-native-firestack';

console.log('initialize')
//Firebase.initialize();
// const firestack = new Firestack({
//   debug: true
// });
console.log('after initialize')


const AppNavigator = DrawerNavigator({
  Home: {
    screen: Home
  },
  Profile: {
    screen: Profile
  },
  Map: {
    screen: MapApp
  },
  Camera: {
    screen: CameraApp
  },
  Timers: { //Cannot navigate to page w/o passing params
    screen: TimerList
  },
  "VIN Search": {
    screen: VINSearch
  },
  History: {
    screen: History
  },
  Metrics: {
    screen: Metrics
  },
  FAQs: {
    screen: FAQs
  }
});


export default class App extends Component {
  render() {
    this.signIn();
    console.log('RUN THIS BABY')
    // Realm.clearTestState(); // Uncomment to drop/recreate database

       this.realm = new Realm({schema: Schema});

    // this.realm.write(() => {
    // this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
    // this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
    // this.realm.create('Coordinates', {latitude: 0, longitude: 0});
    //  this.realm.create('Ticketed', {list: []});
    //  this.realm.create('Expired', {list: []});
    // }); // For beta testing only TODO remove this


    let timerLists = this.realm.objects('Timers');
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object
      let i = 0, lastTime;
      while (lastTime === undefined && (timerLists[i + 1] || ticketList[0].list[i + 1] || expiredList[0].list[i + 1])) { // Edge case for empty first object
        if (timerLists[i].list.length > 0) {
          lastTime = timerLists[i].list[0].createdAt;
          break;
        }
        if (ticketList[0].list.length > 0) {
          lastTime = ticketList[0].list[i].createdAt;
          break;
        }
        if (expiredList[0].list.length > 0) {
          lastTime = expiredList[0].list[i].createdAt;
          break;
        }
        i++;
      }
      let context = this;
      let now = new Date();
      if (!lastTime || now - lastTime > 28800000) { // Reset DB after 8 hours of activity
        this._loopDeletion(timerLists);
        this._loopDeletion(ticketList, true);
        this._loopDeletion(expiredList, true);
        console.log('deletion')
        //TODO Doesn't wait..
        setTimeout(() => {
          console.log('DELETE')
          Realm.clearTestState();
          this.realm = new Realm({schema: Schema});
          this.realm.write(() => {
            this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1, count: 0});
            this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
            this.realm.create('Coordinates', {latitude: 0, longitude: 0});
            this.realm.create('Ticketed', {list: []});
            this.realm.create('Expired', {list: []});
          });
        }, 1000);
      }
    }

    return (
        <AppNavigator/>
    );
  }
  async signIn() {
    let profile = await AsyncStorage.getItem('@Enforce:profileSettings');
    profile = JSON.parse(profile);
    if (profile.email && profile.password) Firebase.signInUser(profile.email, profile.password);
    console.log('signed in user!');
  };

  _loopDeletion(timerLists, once) {
    if (once) {
      timerLists[0].list.forEach((timer, idx) => {
        RNFS.unlink(timer.mediaPath)
        .then(() => {
          console.log('FILE DELETED');
          RNFS.exists(timer.mediaUri)
          .then(() => {
            console.log('PICTURE REMOVED');
            this.realm.write(() => {
              this.realm.delete(timerLists[0]['list'][idx]);
            });
          });
        });
      });
    } else {
      timerLists.forEach((timerList, idx) => {
        timerList.list.forEach((timer, sidx) => {
          RNFS.unlink(timer.mediaPath)
          .then(() => {
            console.log('FILE DELETED');
            RNFS.exists(timer.mediaUri)
            .then(() => {
              console.log('PICTURE REMOVED');
              this.realm.write(() => {
                //timerLists[idx]['list'].pop();
                this.realm.delete(timerLists[idx]['list'][sidx]);
              });
            });
          });
        });
      });
    }
  }
}
