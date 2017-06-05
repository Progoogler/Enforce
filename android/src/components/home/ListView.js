import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
  AsyncStorage,
} from 'react-native';
import realm from 'realm';
import Schema from '../../realm';
import RNFS from 'react-native-fs';
import Row from './Row';
import insertionSortModified from './insertionSort';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginTop: 25,
  },
});

class TimersList extends Component {
  constructor() {
    super();
    console.log('timer list constructor')
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.realm = new Realm();
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
    this.list = insertionSortModified(this.list);
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      refreshing: false,
    };
  }

  render() {
    console.log('TimersList component rerenders')
    return (
      <ListView
        enableEmptySections={true}
        // In next release empty section headers will be rendered.
        // Until then, leave this property alone to mitigate the warning msg.
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing}
            onRefresh={() => { console.log('refresh control')
              this._onRefresh.bind(this)}} />
        }
        timers={this.list}
        style={styles.container}
        dataSource={this.state.dataSource}
        renderRow={(data) => <Row {...data}
          navigation={this.props.navigation}
          deleteRow={this.deleteRow.bind(this)}
          latitude={this.latitude}
          longitude={this.longitude} />}
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
      />
    );
  }

  componentWillMount() {
    // this.latitude = this.realm.objects('Coordinates')[0].latitude;
    // this.longitude = this.realm.objects('Coordinates')[0].longitude;
    // navigator.geolocation.getCurrentPosition(
    //   position => {
    //     this.latitude = parseFloat(position.coords.latitude);
    //     this.longitude = parseFloat(position.coords.longitude);
    //     this.realm.write(() => {
    //       this.realm.objects('Coordinates')[0].latitude = this.latitude;
    //       this.realm.objects('Coordinates')[0].longitude = this.longitude;
    //     });
    //     //this._onRefresh();
    //     console.log('timer list will mount')
    //     // this.getDistanceFromLatLon(this.latitude, this.longitude, this.distLat, this.distLong);
    //     // Cannot call function from parent?
    //   }, error => {
    //     // Cannot animate to coordinates with previous latlng w/o location provider.
    //     // Possible solution is to swap out <MapView.Animated /> w/ initial region set to prev latlng.
    //     console.log('Error loading geolocation:', error);
    //   },
    //   {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
    // );
  }

  componentDidMount() {
    this._checkReset();
  }

  async _checkReset() {
    let time = await AsyncStorage.getItem('@Enforce:timeOfFirstPicture');
    console.log('time', time)
    if (isNaN(parseInt(time))) {
      if (this.realm.objects('Timers').length > 1) {
        let i = 0;
        time = 0;
        while (!time && i < this.realm.objects('Timers').length) {
          let time = this.realm.objects('Timers')[i].list[0].createdAt;
          i++;
        }
      } else {
        return;
      }
    }
    console.log(new Date() - parseInt(time));
    if (new Date() - parseInt(time) > 2880) {
      this._reset();
    }
  }

  _reset() {
    let timerLists = this.realm.objects('Timers');
    console.log('TIMERS OBJ', timerLists, timerLists.length)
    let ticketList = this.realm.objects('Ticketed');
    let expiredList = this.realm.objects('Expired');
    if (timerLists.length >= 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object
      let i = 0, lastTime;
      while (lastTime === undefined && i < timerLists.length) { // Edge case for empty first object
        // Get the earliest value from any list starting from ticket list.
        if (ticketList[0].list.length > i && !lastTime) {
          console.log(ticketList[0].list.length, 'ticket list')
          lastTime = ticketList[0].list[i].createdAt;
          break;
        }
        if (expiredList[0].list.length > i && !lastTime) {
          console.log(expiredList[0].list.length, 'expired list')
          lastTime = expiredList[0].list[i].createdAt;
          break;
        }
        if (timerLists[i].list.length > 0 && !lastTime) {
          console.log(timerLists[i].list[0].createdAt, 'timer list')
          lastTime = timerLists[i].list[0].createdAt;
          break;
        }
        i++;
      }
      let now = new Date();
      console.log('lasttime', lastTime, !lastTime || now - lastTime > 2880)
      if (!lastTime || now - lastTime > 28800000) { // Reset DB after 8 hours of activity 28800000
        //console.log('nav', this.props.navigation)
        // this.props.navigations.state.params = {};
        // this.props.navigation.state.params.reset = true;
        console.log('starting loop')
        this._loopDeletion(timerLists);
        if (ticketList[0].list.length > 0) this._loopDeletion(ticketList, true);
        if (expiredList[0].list.length > 0) this._loopDeletion(expiredList, true);
        //TODO Doesn't wait..
        AsyncStorage.setItem('@Enforce:timeOfFirstPicture', 'null');
        this.list = [];
        this.setState({dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)});
        setTimeout(() => {
          console.log('NEW REALM')
          Realm.clearTestState();
          this.realm = new Realm({schema: Schema});
          this.realm.write(() => {
            this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1, count: 0});
            this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
            this.realm.create('Coordinates', {latitude: 0, longitude: 0});
            this.realm.create('Ticketed', {list: []});
            this.realm.create('Expired', {list: []});
          });
        }, 3000);
      }
    }
  }

  _loopDeletion(timerLists, once) {
    if (once) {
      timerLists[0].list.forEach((timer, idx) => {
        RNFS.unlink(timer.mediaPath)
        .then(() => {
          console.log('FILE DELETED');
            this.realm.write(() => {
              this.realm.delete(timer); //Lists[0]['list'][idx]);
            });
          });
        });
    } else {
      timerLists.forEach((timerList, idx) => {
        timerList.list.forEach((timer, sidx) => {
          RNFS.unlink(timer.mediaPath)
          .then(() => {
            console.log('FILE DELETED');

            this.realm.write(() => {
              //timerLists[idx]['list'].pop();               this.realm.delete(timerLists[idx]['list'][sidx]);
              this.realm.delete(timer);
            });
          });
        });
      });
    }
  }


  // componentWillUpdate() {
  //   console.log('THIS COMPONENT EXISTS')
  //   if (this.props.reset) {
  //     console.log('HALLELUJAH!')
  //     this.list = [];
  //   }
  // }

  deleteRow(timers) {
    console.log('DEL' ,timers)

    timers.forEach((timer, idx) => {
      RNFS.unlink(timer.mediaPath)
      .then(() => {
        console.log('FILE DELETED');
        RNFS.exists(timer.mediaUri)
        .then(() => {
          console.log('PICTURE REMOVED');
          this.realm.write(() => {
            this.realm.delete(timer[idx]['list'][sidx]);
          });
        });
      });
    });

    for (let timerObj in this.list) {
      if (this.list[timerObj].list === timers) {
        this.list[timerObj].list = {};
      }
    }

    setTimeout(() => {
      this.realm.write(() => {
        this.realm.delete(timers);
      });
      this._onRefresh();
    }, 2000);
  }

  _onRefresh() {
    console.log('timer list on refresh')
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
    this.list = insertionSortModified(this.list);
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }
}

export default TimersList;
