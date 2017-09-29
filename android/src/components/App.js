import React, { Component } from 'react';
import { DrawerItems, DrawerNavigator, NavigationActions } from 'react-navigation';
import { View, Image, Text, AsyncStorage, TouchableNativeFeedback, StyleSheet } from 'react-native';

import CameraApp from './camera/CameraApp';
import MapApp from './map/MapApp';
import Overview from './overview';
import Profile from './profile';
import TimerList from './timerList';
import History from './history';
import Metrics from './metrics';
import Settings from './settings';
import FAQs from './faq';

import { screenHeight } from '../styles/common';

import Realm from 'realm';
import Schema from '../db/realm';
import { initialize as FirebaseInitialize, signInUser as FirebaseSignIn }  from '../../../includes/firebase/firebase';

/* global require */
const navigateToOverviewAndReset = (navigation) => {
  const navigationAction = NavigationActions.navigate({
    routeName: 'Overview',
    params: {reset: true}
  });
  navigation.dispatch(navigationAction);
};

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
    contentComponent: props => (
      <View style={{height: screenHeight}}>
          <DrawerItems {...props}/>
          <TouchableNativeFeedback 
            background={TouchableNativeFeedback.Ripple()}
            onPress={() => navigateToOverviewAndReset(props.navigation)}>
            <View style={styles.resetContainer}>
              <View style={styles.icon}>
                <Image source={require('../../../shared/images/reset-icon.png')}/>
              </View>
              <Text style={styles.label}>Reset</Text>
            </View>
          </TouchableNativeFeedback>
      </View>),
    contentOptions: { 
      activeTintColor: 'green',
    },
});

export default class App extends Component {
  render() {
    return (
        <AppNavigator/>
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

const styles = StyleSheet.create({
  resetContainer: {
    alignItems: 'center',
    bottom: 25,
    flexDirection: 'row',
    position: 'absolute', 
    width: 180,
  },
  icon: {
    alignItems: 'center',
    marginHorizontal: 16,
    opacity: .62,
    width: 24,
  },
  label: {
    color: 'black', 
    fontWeight: 'bold',
    margin: 16,
  }
});
