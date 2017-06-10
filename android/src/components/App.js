import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import CameraApp from './camera/CameraApp';
import MapApp from './map/MapApp';
import Overview from './overview';
import Profile from './profile';
import TimerList from './timerList';
import History from './history';
import Metrics from './metrics';
import Settings from './settings';
import FAQs from './faq';
import Realm from 'realm';
import Schema from '../realm';
import { initialize as FirebaseInitialize, signInUser as FirebaseSignIn }  from '../../../includes/firebase/firebase';


const AppNavigator = DrawerNavigator({
  Overview: {
    screen: Overview
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
    return (
        <AppNavigator />
    );
  }

  componentWillMount() {
    FirebaseInitialize(); console.log('Firebase initialized');
    this.realm = new Realm({schema: Schema});
    this.signIn(); console.log('Signed into Firebase');
  }

  _resetRealmState() { // For beta testing only TODO remove this
    Realm.clearTestState(); // Uncomment to drop/recreate database
    this.realm = new Realm({schema: Schema});
    this.realm.write(() => {
      this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
      this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
      this.realm.create('Coordinates', {latitude: 0, longitude: 0});
      this.realm.create('Ticketed', {list: []});
      this.realm.create('Expired', {list: []});
    });
  }

  async signIn() {
    let profile = await AsyncStorage.getItem('@Enforce:profileSettings');
    profile = JSON.parse(profile);
    if (profile.email && profile.password) FirebaseSignIn(profile.email, profile.password);
  };

}
