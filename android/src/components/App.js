import React, { Component } from 'react';
//import { AsyncStorage } from 'react-native';

import { DrawerNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
//import { createStore } from 'redux';

//import cameraReducer, { storageState } from './camera/cameraReducer';

import { CameraApp } from './camera/CameraApp';
import MapApp from './map/MapApp';
import Home from './home';
import TimerList from './timerList';

import Realm from 'realm';
import Schema from '../realm';
//const store = createStore(cameraReducer);

const AppNavigator = DrawerNavigator({
  Home: {
    screen: Home,
  },
  Map: {
    // screen: MapApp,
    screen: MapApp,
  },
  Camera: {
    screen: CameraApp,
  },
  TimerList: {
    screen: TimerList,
  },
});

export default class App extends Component {
  render() {
    //Realm.clearTestState(); // Uncomment to drop/recreate database
    this.realm = new Realm({schema: Schema});
    return (
      // <Provider>
        <AppNavigator/>
      // </Provider>
    );
  }
}
