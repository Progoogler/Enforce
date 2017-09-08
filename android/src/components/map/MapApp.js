import React, { Component } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import PropTypes from 'prop-types';
import Realm from 'realm';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import Navigation from '../navigation/StaticNavigation';
import LocationDetailsView from './LocationDetailsView';
import CustomCallout from './CustomCallout';
import ErrorMessage from './ErrorMessage';

import { smallFontSize } from '../../styles/common';

/*global require*/
export default class MapApp extends Component {
  constructor() {
    super();
    this.state = {
      animating: true,
      showError: false,
      showLocationTip: false,
      polyline: [],
    };
    this.animated = false;
    this.animatedMap = undefined;
    this._accessedLocation = false;
    this.realm = new Realm();
    this._marker = undefined;
  }

  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/blue-pin-icon.png')} />
    )
  };

  render() {
    return (
      <View style={styles.container} >

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
            { this.state.polyline[0] }
        </MapView.Animated>

        <Navigation
          navigation={this.props.navigation}
          title={'Map View'}
          route={'Map'}
          imageSource={require('../../../../shared/images/white-pin.jpg')} />

         {this.state.showLocationTip ? <LocationDetailsView /> : null }

        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' />

        { this.state.showError ? <ErrorMessage checkLocationAndRender={this.checkLocationAndRender.bind(this)} /> : <View /> }
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Enforce</Text>
        </View>
      </View>
    );
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this._accessedLocation = true;
        let latitude = parseFloat(position.coords.latitude);
        let longitude = parseFloat(position.coords.longitude);
        if (this.animatedMap) {
          this._animateToCoord(latitude, longitude);
        } else {
          setTimeout(() => this._animatedToCoord(latitude, longitude), 1500);
        }
        this.realm.write(() => {
          this.realm.objects('Coordinates')[0].latitude = latitude;
          this.realm.objects('Coordinates')[0].longitude = longitude;
        });
      }, () => {},
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
    );
  }


  componentDidMount() {
    this._mounted = true;
    this._checkAndGetCoordinates();
    this._checkAndDrawPolyline();
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._mounted = false;
    if (this.props.navigation.state.params) {
      // Remove params for fresh state when main Map Button is pressed
      this.props.navigation.state.params = undefined;
    }
  }

  async _checkAndGetCoordinates() {
    if (this.props.navigation.state.params && this.props.navigation.state.params.timers[0].latitude) {
      this._animateToCoord(this.props.navigation.state.params.timers[0].latitude, this.props.navigation.state.params.timers[0].longitude);
      return;
    }

    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);
    if (settings && settings.location && !this._accessedLocation) this.checkLocationAndRender();

  }

  _checkAndDrawPolyline() {
    if (this.props.navigation.state.params) {
      let coords = [];
      this.props.navigation.state.params.timers.forEach( timer => {
        coords.push({
          'latitude': timer.latitude,
          'longitude': timer.longitude,
        });
      });
      if (!this.props.navigation.state.params.timers[0].description) {
        this,_mounted && this.setState({
          polyline: [
            <MapView.Polyline
              coordinates={coords}
              strokeWidth={5}
              strokeColor='red'
              key={1}
              />
          ],
          showLocationTip: true,
        });
        setTimeout(() => {
          this._mounted && this.setState({showLocationTip: false});
        }, 5000);
      } else {
        this._mounted && this.setState({
          polyline: [
            <MapView.Polyline
              coordinates={coords}
              strokeWidth={5}
              strokeColor='red'
              key={1}
              />
          ],
        });
      }
    }
  }

  getLocationDetails() {
    if (this.props.navigation.state.params) {
      let details = "", i = 0;
      while (details.length === 0 && i < this.props.navigation.state.params.timers.length) {
        details = this.props.navigation.state.params.timers[i].description;
        i++;
      }
      if (!details) return (<LocationDetailsView />);
    }
  }

  _animateToCoord(lat: number, long: number) {
      this._mounted && this.animatedMap._component.animateToCoordinate({
        latitude: lat,
        longitude: long,
      }, 1500);
      if (!this.animated) {
        this.animated = true;
        this._mounted && this.setState({animating: false});
      }
    }

  setMarkers(markers) { // TODO Unused function: Fix it or ditch it.
    this.animatedMap._component.fitToSuppliedMarkers(markers);
  }

  _resetTimerCoords(index: number, coords: object, secondaryIndex: number) {
    this.realm.write(() => {
      this.realm.objects('Timers')[index].list[secondaryIndex !== null ? secondaryIndex : 0].latitude = coords.latitude;
      this.realm.objects('Timers')[index].list[secondaryIndex !== null ? secondaryIndex : 0].longitude = coords.longitude;
    });
  }

  getMarkers() {
    const markers = [];
    let lat, long, aux;
    let soonest = Number.POSITIVE_INFINITY;
    if (!this.props.navigation.state.params) {
      let lists = this.realm.objects('Timers');
      let i = 0;
      lists.forEach(timerList => {
        if (timerList.list.length > 0) {
          aux = timerList.list[0].createdAt + (timerList.list[0].timeLength * 60 * 60 * 1000);
          if (aux < soonest) {
            soonest = aux;
            lat = timerList.list[0].latitude !== 0 ? timerList.list[0].latitude : lat;
            long = timerList.list[0].longitude !== 0 ? timerList.list[0].longitude : long;
          }
          markers.push(
            <Marker draggable
              coordinate={{latitude: timerList.list[0].latitude, longitude: timerList.list[0].longitude}}
              onDragEnd={(e) => this._resetTimerCoords(timerList.list[0].index, e.nativeEvent.coordinate, null)}
              key={timerList.list[0].createdAt} >
              <CustomCallout timer={timerList.list[0]} title="1st" />
            </Marker>
          );
        }
        if (lists[i+1] === undefined) {
          if (lat > 0) {
            this._timeout = setTimeout(() => {
              this._animateToCoord(lat, long);
            }, 1500);
          }
        }
        i++;
      });
      return markers;
    } else {

      if (this.props.navigation.state.params.historyView) {
        let dataObj = this.props.navigation.state.params.timers;
        markers.push(<Marker draggable
            coordinate={{latitude: dataObj.latitude, longitude: dataObj.longitude}}
            key={dataObj.createdAt} />
        );
        if (dataObj.latitude > 0) {
          this._timeout = setTimeout(() => {
            this._animateToCoord(dataObj.latitude, dataObj.longitude);
          }, 1500);
        }
        return markers;
      }
      // Else check timers in params
      let arr = this.props.navigation.state.params.timers;
      markers.push(<Marker draggable
          coordinate={{latitude: arr[0].latitude, longitude: arr[0].longitude}}
          onDragEnd={(e) => this._resetTimerCoords(arr[0].index, e.nativeEvent.coordinate, 0)}
          key={arr[0].createdAt} >
          <CustomCallout timer={arr[0]} title="1st" />
        </Marker>
      );
      arr.forEach((timer, idx) => {
         if (idx !== 0) {
           markers.push(<Marker draggable
             coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
             onDragEnd={(e) => this._resetTimerCoords(arr[idx].index, e.nativeEvent.coordinate, idx)}
             key={timer.createdAt} >
             <CustomCallout timer={arr[idx]} secondary={true}/>
            </Marker>
           );
         }
      });
      if (arr[0].latitude > 0) { // TODO else...
        this._timeout = setTimeout(() => {
          this._animateToCoord(arr[0].latitude, arr[0].longitude);
        }, 1500);
      }
    }
    return markers;
  }

  checkLocationAndRender() {
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2>Use Location ?</h2>Enforce wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/>",
        ok: "OK",
        cancel: "Continue without"
    }).then(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude);
          this._animateToCoord(latitude, longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = latitude;
            this.realm.objects('Coordinates')[0].longitude = longitude;
          });
          if (this._mounted && this.state.showError) this.setState({showError: false, animating: false});
        }, () => {
          this._mounted && this.setState({showError: true, animating: false});
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    });
  }

}

MapApp.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
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
  },
  logoContainer: {
    position: 'absolute',
    bottom: 7,
    right: 10,
  },
  logo: {
    color: 'white',
    fontSize: smallFontSize,
    fontWeight: '400',
    textShadowColor: 'grey',
    textShadowRadius: 5,
    textShadowOffset: {
      width: 2,
      height: 1
    }
  },
});
