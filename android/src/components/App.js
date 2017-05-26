import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import { CameraApp } from './camera/CameraApp';
import MapApp from './map/MapApp';
import Home from './home';
import TimerList from './timerList';
import Realm from 'realm';
import Schema from '../realm';


const AppNavigator = DrawerNavigator({
  Home: {
    screen: Home,
  },
  Map: {
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
    if (this.realm.objects('Timers')[0]) {
      let lastTime = this.realm.objects('Timers')[0].list[0].createdAt;
      let now = new Date() / 1000;
      if (now - lastTime > 28800) {
        Realm.clearTestState(); // Uncomment to drop/recreate database
        this.realm = new Realm({schema: Schema});
      }
    }

    return (
        <AppNavigator/>
    );
  }
}
