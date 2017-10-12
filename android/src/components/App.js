import React, { Component } from 'react';
import { DrawerItems, DrawerNavigator, NavigationActions } from 'react-navigation';
import { View, Image, Text, AsyncStorage, TouchableNativeFeedback, StyleSheet } from 'react-native';

import Overview from './overview';
import MapApp from './map';
import CameraApp from './camera';
import TimerList from './timerList';
import History from './history';
import Metrics from './metrics';
import Profile from './profile';
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
      </View>
    ),
    contentOptions: { 
      activeTintColor: 'green',
    },
});

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      currentDay: 0,
      dataUpload: true,
      imageUpload: false,
      imageRecognition: false,
      locationReminder: false,
      profileState: '',
      refPath: '',
    };
  }
  render() {
    return (
        <AppNavigator 
          screenProps={{
            currentDay: this.state.currentDay,
            dataUpload: this.state.dataUpload,
            imageUpload: this.state.imageUpload,
            imageRecognition: this.state.imageRecognition, 
            locationReminder: this.state.locationReminder,
            profileState: this.state.profileState,
            refPath: this.state.refPath,
            updateDataUpload: this.setDataUpload.bind(this),
            updateImageUpload: this.setImageUpload.bind(this),
            updateImageRecognition: this.setCameraType.bind(this),
            updateLocationReminder: this.setLocationSetting.bind(this),
            updateProfileState: this.updateProfileState.bind(this),
            updateRefPath: this.updateRefPath.bind(this),
          }}
        />
    );
  }

  componentWillMount() {
    // this._resetRealmState();
    FirebaseInitialize();
    this._checkFirstTimeAccess();
    this._signIn();
    this._getSettings();
  }

  async _getSettings() {
    var currentDay = await AsyncStorage.getItem('@Enforce:currentDay');
    if (currentDay) {
      this.setState({currentDay: parseInt(currentDay)});
    } else {
      let today = new Date().getDate();
      AsyncStorage.setItem('@Enforce:currentDay', `${today}`);
    }
    var settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);
    if (settings) {
      if (settings.imageRecognition) this.setState({imageRecognition: true});
      if (settings.location) this.setState({locationReminder: true});
      if (!settings.dataUpload) this.setState({dataUpload: false});
      if (settings.imageUpload) this.setState({imageUpload: true});
    }
    var profileSettings = await AsyncStorage.getItem('@Enforce:profileSettings');
    profileSettings = JSON.parse(profileSettings);
    if (profileSettings) this.setState({profileState: profileSettings.state});
    var refPath = await AsyncStorage.getItem('@Enforce:refPath');
    if (refPath) this.setState({refPath});
  }

  setCameraType(update: boolean) {
    this.setState({imageRecognition: update});
  }

  setLocationSetting(update: boolean) {
    this.setState({locationReminder: update});
  }

  setDataUpload(update: boolean) {
    this.setState({dataUpload: update});
  }

  setImageUpload(update: boolean) {
    this.setState({imageUpload: update});
  }

  updateRefPath(refPath: string) {
    this.setState({refPath});
  }

  updateProfileState(profileState: string) {
    this.setState({profileState});
  }

  async _checkFirstTimeAccess() {
    let firstTimeAccess = await AsyncStorage.getItem('@Enforce:registerDate');
    if (!firstTimeAccess) { // Establish realm schema if user is opening app for the first time
      this._resetRealmState();
      let today = new Date();
      let day = today.getDate() + '';
      let date = `${today.getMonth() + 1}-${day}`;
      AsyncStorage.setItem('@Enforce:registerDate', date);
    }
  }

  _resetRealmState() { 
    Realm.clearTestState();
    this.realm = new Realm({schema: Schema});
    this.realm.write(() => {
      this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
      this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
      this.realm.create('Coordinates', {latitude: 0, longitude: 0, time: 0});
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
