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
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import Navigation from '../home/Header';
import LocationDetailsView from './LocationDetailsView';
import CustomCallout from './CustomCallout';
import ErrorMessage from './ErrorMessage';

export default class MapApp extends Component {
  constructor() {
    super();
    this.state = {
      animating: true,
      modalVisible: false,
      showError: false,
    };
    this.animated = false;
    this.animatedMap = undefined;
    this.realm = new Realm();
  }
  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../../../../shared/images/blue-pin.png')}
        style={[styles.icon]}
      />
    )
  };

  componentDidMount() {
    if (this.props.navigation.state.params) this.setModalVisible();
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: "YES",
        cancel: "NO"
    }).then(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude); console.log('GEO', latitude)
          this._animateToCoord(latitude, longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = latitude;
            this.realm.objects('Coordinates')[0].longitude = longitude;
          });
        }, error => {
          this.setState({showError: true});
          // Cannot animate to coordinates with previous latlng w/o location provider.
          // Possible solution is to swap out <MapView.Animated /> w/ initial region set to prev latlng.
          console.log('Error loading geolocation:', error); //TODO Save and Get location units from Realm
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    })
    .catch(() => {
      this.setState({showError: true});
    });
  }

  componentWillUnmount() {
    if (this.state.modalVisible) {
      this.setState({modalVisible: false});
    }
    if (this.props.navigation.state.params) {
      // Remove params for fresh state when main Map Button is pressed
      this.props.navigation.state.params = undefined;
    }
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
            latitude: this.realm.objects('Coordinates')[0].latitude ? this.realm.objects('Coordinates')[0].latitude : 37.78926,
            longitude: this.realm.objects('Coordinates')[0].longitude ? this.realm.objects('Coordinates')[0].longitude : -122.43159,
            latitudeDelta: 0.0108,
            longitudeDelta: 0.0060,
          }} >
            { this.getMarkers() }
        </MapView.Animated>

        { this.state.showError ? <ErrorMessage /> : <View /> }
      </View>
    );
  }

  _animateToCoord(lat, long) {
    console.log('ANIMATE', lat)
      this.animatedMap._component.animateToCoordinate({
        latitude: lat,
        longitude: long,
      }, 1500);
      if (!this.animated) {
        this.animated = true;
        this.setState({animating: false});
      }
    }

  setMarkers() {
    this.animatedMap._component.fitToSuppliedMarkers(this.markers);
  }

  getMarkers() {
    const markers = [];
    let lat, long, aux;
    let soonest = Number.POSITIVE_INFINITY;
    if (!this.props.navigation.state.params) {
      let lists = this.realm.objects('Timers');
      let i = 0;
      this.realm.objects('Timers').forEach(timerList => {
        if (timerList.list.length > 0) {
          aux = timerList.list[0].createdAt + (timerList.list[0].timeLength * 60 * 60);
          if (aux < soonest) {
            soonest = aux;
            lat = timerList.list[0].latitude !== 0 ? timerList.list[0].latitude : lat;
            long = timerList.list[0].longitude !== 0 ? timerList.list[0].longitude : long;
          }
          markers.push(
            <MapView.Marker
              coordinate={{latitude: timerList.list[0].latitude, longitude: timerList.list[0].longitude}}
              image={require('../../../../shared/images/pin-orange.png')}
              key={timerList.list[0].createdAt} >
              <CustomCallout timer={timerList.list[0]} title="1st" />
            </MapView.Marker>
          );
        }
        if (lists[i+1] === undefined) {
          if (lat > 0) {
            setTimeout(() => {
              this._animateToCoord(lat, long);
            }, 1500);
          }
        }
        i++;
      });
    } else {
      let arr = this.props.navigation.state.params.timers;
      markers.push(<MapView.Marker
          coordinate={{latitude: arr[0].latitude, longitude: arr[0].longitude}}
          image={require('../../../../shared/images/pin-orange.png')}
          key={arr[0].createdAtDate} >
          <CustomCallout timer={arr[0]} title="1st" />
        </MapView.Marker>
      );
      arr.forEach(timer => {
         markers.push(<MapView.Marker
           coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
           image={require('../../../../shared/images/pin-orange.png')}
           key={timer.createdAt} />
         );
      });
      if (arr[0].latitude > 0) {
        setTimeout(() => {
          this._animateToCoord(arr[0].latitude, arr[0].longitude);
        }, 1500);
      }
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
