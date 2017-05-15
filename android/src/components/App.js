import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

import { DrawerNavigator } from 'react-navigation';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';

import cameraReducer, { storageState } from './camera/cameraReducer';

import { CameraApp } from './camera/CameraApp';
import MapApp from './map/MapApp';

//const store = createStore(cameraReducer);

const AppNavigator = DrawerNavigator({
  Map: {
    screen: MapApp,
  },
  Camera: {
    screen: CameraApp,
  },
});

export default class App extends Component {
  constructor() {
    super();
    this.storageState = {};
  }

  async componentWillMount() {
    //this.storageState = await AsyncStorage.getItem('@Quicket:test');
    this.storageState = await storageState;
    // bull ----->
    console.log('hahah', this.storageState, storageState);

  }

  render() {
    console.log('storage', this.storageState);
    return (
      <Provider store={createStore(cameraReducer)}>
        <AppNavigator/>
      </Provider>
    );
  }

  // componentWillUnmount() {
  //   const stringifiedStore = JSON.stringify(store.getState());
  //   console.log(stringifiedStore);
  //   AsyncStorage.setItem('@Quicket:test', stringifiedStore);
  //   this.unsubscribe();
  // }
}
