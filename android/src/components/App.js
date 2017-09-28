import React, { Component } from 'react';
import { DrawerItems, DrawerNavigator } from 'react-navigation';
import { View, Image, AsyncStorage } from 'react-native';

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
import Schema from '../db/realm';
import { initialize as FirebaseInitialize, signInUser as FirebaseSignIn }  from '../../../includes/firebase/firebase';

/* global require */
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
}, {
    drawerWidth: 180,
//     contentComponent: props => (
//        <View style={{flexDirection: 'row'}}>
//           <View style={{flex: 1}}>
//               <View style={{marginBottom: -3, height: 145, flexDirection: 'row', backgroundColor: 'rgba(200, 200, 200, .3)'}} >
//                     <View style={{height: 145, width: 25, backgroundColor: '#4286f4'}} />
//                     <View style={{flexDirection: 'column'}}>
//                           <View style={{backgroundColor: '#4286f4', width: 160, height: 25, justifyContent: 'flex-end', alignItems: 'flex-end', borderBottomRightRadius: 25}} >
//                             <Image style={{height: 16, width: 16, marginRight: 20,}} source={require('../../../shared/images/pin-orange.png')} />
//                           </View>
//                           <View style={{height: 35, width: 150}} />
//                           <View style={{backgroundColor: '#4286f4', width: 150, height: 25, borderTopRightRadius: 10, borderBottomRightRadius: 10}} />
//                           <View style={{height: 35, width: 150, flexDirection: 'row'}} >
//                             <Image style={{height: 25, width: 25, alignSelf: 'flex-end'}} source={require('../../../shared/images/blue-pin.png')} />
//                           </View>
//                       <View style={{backgroundColor: '#4286f4', width: 160, height: 25, borderTopRightRadius: 25}} />
//                 </View>
//           </View>
//
//           <DrawerItems {...props} />
//           </View>
//           <View style={{
//             position: 'absolute',
//             right: 0,
//             top: 145,
//             width: 5,
//             height: 1000,
//             backgroundColor: '#4286f4', }} />
//         </View>),
    contentOptions: {
      activeTintColor: 'green',
    },
});

export default class App extends Component {
  render() {
    return (
        <AppNavigator />
    );
  }

  componentWillMount() {
    FirebaseInitialize();
    this._checkFirstTimeAccess();
    this._signIn();
  }

  async _checkFirstTimeAccess() {
    let firstTimeAccess = await AsyncStorage.getItem('@Enforce:registerDate');
    if (!firstTimeAccess) {
      this._resetRealmState();
      let today = new Date();
      let day = today.getDate() + '';
      let date = `${today.getMonth() + 1}-${day}`;
      AsyncStorage.setItem('@Enforce:registerDate', date);
    }
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

  async _signIn() {
    let profile = await AsyncStorage.getItem('@Enforce:profileSettings');
    profile = JSON.parse(profile);
    if (profile && (profile.email && profile.password)) FirebaseSignIn(profile.email, profile.password);
  }

}
