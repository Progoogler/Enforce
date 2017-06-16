import React, { Component } from 'react';
import { DrawerItems, DrawerNavigator } from 'react-navigation';
import { View, Text, Image, AsyncStorage, Dimensions } from 'react-native';
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
  } //<View style={{backgroundColor: '#4286f4', width: 130, height: 25,}}>
}, {
    drawerWidth: 180,
    contentComponent: props => (<View style={{flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                  <View style={{marginBottom: -3, borderBottomWidth: 1, height: 145, flexDirection: 'row'}} >
                                    <View style={{height: 145, width: 25, backgroundColor: '#4286f4'}} />
                                    <View style={{flexDirection: 'column'}}>
                                      <View style={{backgroundColor: '#4286f4', width: 160, height: 25, justifyContent: 'flex-end', alignItems: 'flex-end'}} >
                                        <Image style={{height: 16, width: 16, marginRight: 10,}} source={require('../../../shared/images/pin-orange.png')} />
                                      </View>
                                      <View style={{height: 35, width: 150}} />
                                      <View style={{backgroundColor: '#4286f4', width: 150, height: 25,}} />
                                      <View style={{height: 35, width: 150, marginLeft: 1, flexDirection: 'row'}} >
                                        <Image style={{height: 25, width: 25, alignSelf: 'flex-end'}} source={require('../../../shared/images/blue-pin.png')} />
                                        </View>
                                      <View style={{backgroundColor: '#4286f4', width: 160, height: 25,}} />
                                    </View>
                                  </View>

                                  <DrawerItems {...props} />
                                  </View>
                                  <View style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 145,
                                    width: 5,
                                    height: 1000,
                                    backgroundColor: '#4286f4', }} />
                                </View>),
    contentOptions: {
      activeTintColor: '#4286f4',
      style: {

      },
    },
});
//<Text style={{fontSize: 22, marginLeft: 15, color: '#4286f4'}}>Navigation</Text>
//<Image style={{height: 16, width: 16}} source={require('../../../shared/images/pin-orange.png')} />
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
