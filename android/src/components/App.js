import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import { CameraApp } from './camera/CameraApp';
import MapApp from './map/MapApp';
import Home from './home';
import Profile from './profile';
import TimerList from './timerList';
import VINSearch from './search';
import History from './history';
import Metrics from './metrics';
import Settings from './settings';
import FAQs from './faq';
import Realm from 'realm';
import Schema from '../realm';
import Firebase from '../../../includes/firebase/firebase';

console.log('initialize')
Firebase.initialize();
console.log('after initialize')


const AppNavigator = DrawerNavigator({
  Home: {
    screen: Home
  },
  Map: {
    screen: MapApp
  },
  Camera: {
    screen: CameraApp
  },
  Timers: {
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
  Profile: {
    screen: Profile
  },
  Settings: {
    screen: Settings
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



    //console.log('reset?', this.props.navigation.state.params.reset)
    return (
        <AppNavigator />
    );
  }
  async signIn() {
    let profile = await AsyncStorage.getItem('@Enforce:profileSettings');
    profile = JSON.parse(profile);
    if (profile.email && profile.password) Firebase.signInUser(profile.email, profile.password);
    console.log('signed in user!');
  };


}
