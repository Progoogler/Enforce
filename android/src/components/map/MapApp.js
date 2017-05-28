import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
  View,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
} from 'react-native';
import Realm from 'realm';

import Navigation from '../home/Header';
import LocationDetailsView from './LocationDetailsView';

export default class MapApp extends Component {
  constructor() {
    super();
    // this.realm = new Realm({
    //   schema: [{name: 'Dog', properties: {name: 'string'}}, TimerSchema, CameraTimeSchema, TimerListSchema, TimerCountSchema]
    // });
    this.state = {
      animating: true,
      modalVisible: false,
    };
    this.animatedMap = undefined;
    this.latitude = undefined;
    this.longitude = undefined;
    this.realm = new Realm();
  }
  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../../../../shared/images/blue-pin.jpg')}
        style={[styles.icon]}
      />
    )
  };

  componentDidMount() {
    if (this.props.navigation.state.params) this.setModalVisible();
    navigator.geolocation.getCurrentPosition(
      position => {
        let latitude = parseFloat(position.coords.latitude);
        let longitude = parseFloat(position.coords.longitude);
        this._animateToCoord(latitude, longitude);
      }, error => {
        console.log('Error loading geolocation:', error); //TODO Save and Get location units from Realm
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  getLocationDetails() {
    if (this.props.navigation.state.params) {
      return (<LocationDetailsView navigation={this.props.navigation}/>);
    }
  }

  render() {
    return (
      <View style={styles.container} >
        <Navigation navigation={this.props.navigation} />

        {this.getLocationDetails()}

        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' />

        <MapView.Animated
          ref={ref => { this.animatedMap = ref; }}
          style={styles.map}
          mapType="hybrid"
          showsUserLocation={true}
          initialRegion={{
            latitude: 37.78926,
            longitude: -122.43159,
            latitudeDelta: 0.0048,
            longitudeDelta: 0.0020,
          }} >
            { this.getMarkers() }
        </MapView.Animated>
      </View>
    );
  }

  _animateToCoord(lat, long) {
      this.animatedMap._component.animateToCoordinate({
        latitude: lat,
        longitude: long,
      }, 1500);
      this.setState({animating: false});
    }

  setMarkers() {
    this.animatedMap._component.fitToSuppliedMarkers(this.markers);
  }

  getMarkers() {
    const markers = [];

    if (!this.props.navigation.state.params) {
      this.realm.objects('Timers').forEach(timerList => {
        timerList.list.forEach(list => {
          markers.push(<MapView.Marker
            coordinate={{latitude: list.latitude, longitude: list.longitude}}
            key={list.createdAt} />
          );
        });
      });
    } else {
      let arr = this.props.navigation.state.params.timers;
      arr.forEach(timer => {
         markers.push(<MapView.Marker
           coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
           key={timer.createdAt} />
         );
      });
    }
    return markers;
  }

  setModalVisible() {
    this.setState({modalVisible: !this.state.modalVisible});
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  activity: {
    flex: 1,
    zIndex: 10,
  }
});
