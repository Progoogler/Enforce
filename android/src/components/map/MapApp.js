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
import LocationView from './LocationView';
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
      polyline: [],
      description: '',
      fadeDescription: false,
      mapPositionBottom: 0,
    };
    this.animated = false;
    this._accessedLocation = false;
    this.animatedToMarker = false;
    this.errorDescription = 'No location details were found. Remember to turn on GPS or input location details before taking pictures.';
    this.description = '';
    this.animatedMap = undefined;
    this._marker = undefined;
    this.realm = new Realm();
    this.timersArray = [];
    this.markers = [];
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
        <Navigation
          navigation={this.props.navigation}
          title={'Map View'}
          route={'Map'}
          imageSource={require('../../../../shared/images/white-pin.jpg')} />

        <LocationView description={this.state.description} fadeDescription={this.state.fadeDescription}/>

        <MapView.Animated
          ref={ref => { this.animatedMap = ref; }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: this.state.mapPositionBottom,
          }}
          mapType="hybrid"
          showsUserLocation={true}
          initialRegion={{
            latitude: this.realm.objects('Coordinates')[0].latitude ? this.realm.objects('Coordinates')[0].latitude : 37.78926,
            longitude: this.realm.objects('Coordinates')[0].longitude ? this.realm.objects('Coordinates')[0].longitude : -122.43159,
            latitudeDelta: 0.0108,
            longitudeDelta: 0.0060,
          }} >
            { this.markers.length ? this.markers : this._getMarkers() }
            { this.state.polyline[0] }
        </MapView.Animated>

        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' />

        { this.state.showError ? <ErrorMessage checkLocationAndRender={this.checkLocationAndRender.bind(this)} /> : <View /> }
      </View>
    );
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this._accessedLocation = true;
        let latitude = parseFloat(position.coords.latitude);
        let longitude = parseFloat(position.coords.longitude);

        if (!this.props.navigation.state.params  || !this.realm.objects('Timers')[this.props.navigation.state.params.timersIndex].list[0].latitude) {
           if (this.animatedMap) {
             this._animateToCoord(latitude, longitude);
           } else {
             setTimeout(() => this._mounted && this._animateToCoord(latitude, longitude), 1500);
           }
         }

        setTimeout(() => { // Write the coordinates to Realm later after component has finished loading
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = latitude;
            this.realm.objects('Coordinates')[0].longitude = longitude;
          });
        }, 5000);
      }, () => {},
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
    );
  }


  componentDidMount() {
    this._mounted = true;
    this._checkAndGetCoordinates();
    this._checkAndDrawPolyline();
    setTimeout(() => {
      if (!this.animatedToMarker && !this.description) {
        this._displayDescription(this.errorDescription, true);
      } else if (!this.animatedToMarker && this.description) {
        this._displayDescription(this.description);
      } else if (this.props.navigation.state.params && this.description) {
        this._displayDescription(this.description);
      }

      if (!this.animatedToMarker && !this._accessedLocation) this._mounted && this.setState({showError: true, animating: false, mapPositionBottom: 10});
    }, 3000);
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
    if (this.props.navigation.state.params && typeof this.props.navigation.state.params.timersIndex === 'number') {
      this.timersArray = this.realm.objects('Timers')[this.props.navigation.state.params.timersIndex].list;
      if (this.timersArray[0].latitude) {
        this._mounted && this._animateToCoord(this.timersArray[0].latitude, this.timersArray[0].longitude);
        this.animatedToMarker = true;
        return;
      } else {
        for (let i = 1; i < this.timersArray.length; i++) {
          if (this.timersArray[i].latitude) {
            this.animatedToMarker = true;
            this._timeout = setTimeout(() => {
              this._mounted && this._animateToCoord(this.timersArray[i].latitude, this.timersArray[i].longitude);
            }, 1500);
            return;
          }
        }
      }
    }

    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);
    if (settings && settings.location && !this._accessedLocation) this.checkLocationAndRender();
  }

  _checkAndDrawPolyline() {
    if (this.timersArray.length) {
      let coords = [];
      this.timersArray.forEach( timer => {
        coords.push({
          'latitude': timer.latitude,
          'longitude': timer.longitude,
        });
      });
      this._mounted && this.setState({
        polyline: [
          <MapView.Polyline
            coordinates={coords}
            strokeWidth={5}
            strokeColor='red'
            key={1}
          />
        ]
      });
    }
  }

  _animateToCoord(lat: number, long: number) {
    this._mounted && this.animatedMap._component.animateToCoordinate({
      latitude: lat,
      longitude: long,
    }, 1500);
    if (!this.animated) this.animated = true;
    if (!this.state.animating) this._mounted && this.setState({animating: false});
  }

  _setMarkers(markers) { // TODO Unused function: Fix it or ditch it.
    this.animatedMap._component.fitToSuppliedMarkers(markers);
  }

  _resetTimerCoords(index: number, coords: object, secondaryIndex: number) {
    this.realm.write(() => {
      this.realm.objects('Timers')[index].list[secondaryIndex !== null ? secondaryIndex : 0].latitude = coords.latitude;
      this.realm.objects('Timers')[index].list[secondaryIndex !== null ? secondaryIndex : 0].longitude = coords.longitude;
    });
  }

  _displayDescription(description, fadeDescription) {
    this._mounted && this.setState({description, fadeDescription});
    if (this.state.fadeDescription) setTimeout(() => this._mounted && this.setState({fadeDescription: false}), 7800);
  }

  _getMarkers() {
    let lat, long, aux;
    let soonest = Number.POSITIVE_INFINITY;
    if (!this.props.navigation.state.params) {
      let lists = this.realm.objects('Timers');
      lists.forEach((timerList, idx) => {
        if (timerList.list.length > 0) {
          aux = timerList.list[0].createdAt + (timerList.list[0].timeLength * 60 * 60 * 1000);
          if (aux < soonest && timerList.list[0].latitude !== 0) {
            soonest = aux;
            lat = timerList.list[0].latitude;
            long = timerList.list[0].longitude;
          } else if (aux < soonest) {
            this.description = timerList.list[0].description;
          }
          this.markers.push(
            <Marker draggable
              coordinate={{latitude: timerList.list[0].latitude, longitude: timerList.list[0].longitude}}
              onPress={() => this._displayDescription(timerList.list[0].description)}
              onDragEnd={(e) => this._resetTimerCoords(timerList.list[0].index, e.nativeEvent.coordinate, null)}
              key={timerList.list[0].createdAt} >
              <CustomCallout timer={timerList.list[0]} title="1st"/>
            </Marker>
          );
        }

        if (lists[idx+1] === undefined) {
          if (lat > 0) {
            this.animatedToMarker = true;
            this._timeout = setTimeout(() => {
              this._animateToCoord(lat, long);
            }, 1500);
          }
        }
      });
      return this.markers;
    } else {
      // Else check timers in params
      if (!this.timersArray.length) this.timersArray = this.realm.objects('Timers')[this.props.navigation.state.params.timersIndex].list;
      this.description = this.timersArray[0].description ? this.timersArray[0].description : '';

      this.markers.push(<Marker draggable
          coordinate={{latitude: this.timersArray[0].latitude, longitude: this.timersArray[0].longitude}}
          onPress={() => this._displayDescription(this.timersArray[0].description)}
          onDragEnd={(e) => this._resetTimerCoords(this.timersArray[0].index, e.nativeEvent.coordinate, 0)}
          key={this.timersArray[0].createdAt} >
          <CustomCallout timer={this.timersArray[0]} title="1st" />
        </Marker>
      );
      this.timersArray.forEach((timer, idx) => {
         if (idx !== 0) {
           if (!this.description && timer.description) this.description = timer.description;
           if (timer.latitude) {
             this.markers.push(<Marker draggable
               coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
               onPress={() => this._displayDescription(timer.description)}
               onDragEnd={(e) => this._resetTimerCoords(this.timersArray[idx].index, e.nativeEvent.coordinate, idx)}
               key={timer.createdAt} >
               <CustomCallout timer={timer} secondary={true}/>
               </Marker>
             );
           }
         }
      });

      if (this.timersArray[0].latitude) {
        this.animatedToMarker = true;
        this._timeout = setTimeout(() => {
          this._animateToCoord(this.timersArray[0].latitude, this.timersArray[0].longitude);
        }, 1500);
      } else { // Try to find the first timer with recorded coordinates and animate there
        for (let i = 1; i < this.timersArray.length; i++) {
          if (this.timersArray[i].latitude) {
            this.animatedToMarker = true;
            this._timeout = setTimeout(() => {
              this._animateToCoord(this.timersArray[i].latitude, this.timersArray[i].longitude);
            }, 1500);
            break;
          }
        }
      }
    }
    return this.markers;
  }

  checkLocationAndRender() {
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2>Use Location ?</h2>Enforce wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/>",
        ok: "OK",
        cancel: "Continue without"
    })
    .then(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (!this.state.animating) this._mounted && this.setState({animating: true});
          this._accessedLocation = true;
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude);
          this._mounted && this._animateToCoord(latitude, longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = latitude;
            this.realm.objects('Coordinates')[0].longitude = longitude;
          });
          if (this._mounted && this.state.showError) this.setState({showError: false, mapPositionBottom: 0});
        }, () => {
          if (!this.state.showError) this._mounted && this.setState({showError: true, animating: false, mapPositionBottom: 10});
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
  activity: {
    flex: 1,
    zIndex: 10,
  },
});
