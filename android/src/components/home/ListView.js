import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
} from 'react-native';
import realm from 'realm';
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
    console.log('list', this.list)
    return (
      <ListView
        enableEmptySections={true}
        // In next release empty section headers will be rendered.
        // Until then, leave this property alone to mitigate the warning msg.
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)} />
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
    this.latitude = this.realm.objects('Coordinates')[0].latitude;
    this.longitude = this.realm.objects('Coordinates')[0].longitude;
    if (!this.latitude) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.latitude = parseFloat(position.coords.latitude);
          this.longitude = parseFloat(position.coords.longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = this.latitude;
            this.realm.objects('Coordinates')[0].longitude = this.longitude;
          });
          this.getDistanceFromLatLon(this.latitude, this.longitude, this.distLat, this.distLong);
        }, error => {
          this.setState({showError: true});
          // Cannot animate to coordinates with previous latlng w/o location provider.
          // Possible solution is to swap out <MapView.Animated /> w/ initial region set to prev latlng.
          console.log('Error loading geolocation:', error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    }
  }

  deleteRow(timers) {
    console.log('DEL' ,timers)

    timers.forEach((timer, idx) => {
      RNFS.unlink(timer.mediaPath)
      .then(() => {
        console.log('FILE DELETED');
        // RNFS.exists(timer.mediaUri)
        // .then(() => {
        //   console.log('PICTURE REMOVED');
        //   this.realm.write(() => {
        //     this.realm.de
        //     this.realm.delete(timer[idx]['list'][sidx]);
        //   });
        // });
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
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }
}

export default TimersList;
