import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import RNFS from 'react-native-fs';
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
    console.log('RENDERS');
    // Realm.clearTestState(); // Uncomment to drop/recreate database
    this.realm = new Realm({schema: Schema});
    // this.realm.write(() => this.realm.create('Ticketed', {list: []})); // For beta testing only TODO remove this
    let timerLists = this.realm.objects('Timers');
    if (timerLists.length > 0) {
      let i = 0, lastTime;
      while (lastTime === undefined) { // Edge case for empty first object
        if (timerLists[i].list.length > 0) lastTime = timerLists[i].list[0].createdAt;
        i++;
      }
      let context = this;
      let now = new Date() / 1000;
      if (now - lastTime > 28800) { // Reset DB after 8 hours of activity
        this._loopDeletion(timerLists)
        //TODO Doesn't wait..
        setTimeout(() => {
          console.log('DELETE')
          Realm.clearTestState(); // Uncomment to drop/recreate database
          this.realm = new Realm({schema: Schema});
          this.realm.write(() => this.realm.create('Ticketed', {list: []}));
        }, 2000);
      }
    }

    return (
        <AppNavigator/>
    );
  }

  _loopDeletion(timerLists) {
    timerLists.forEach((timerList, idx) => {
      timerList.list.forEach((timer, sidx) => {
        RNFS.unlink(timer.mediaPath)
        .then(() => {
          console.log('FILE DELETED');
          RNFS.exists(timer.mediaUri)
          .then(() => {
            console.log('PICTURE REMOVED');
            context.realm.write(() => {
              //timerLists[idx]['list'].pop();
              context.realm.delete(timerLists[idx]['list'][sidx]);
            });
          });
        });
      });
    });
  }
}
