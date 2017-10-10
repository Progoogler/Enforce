import React, { Component } from 'react';
import { Animated as AnimatedMap, Marker, Polyline } from 'react-native-maps';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import PropTypes from 'prop-types';
import Realm from 'realm';

import CustomCallout from './CustomCallout';
import ErrorMessage from './ErrorMessage';
import LocationView from './LocationView';
import Navigation from '../navigation';
import StaticNavigation from '../navigation/StaticNavigation';


/*global require*/
export default class MapApp extends Component {
  constructor() {
    super();
    this.state = {
      animating: true,
      description: '',
      fadeDescription: false,
      mapPositionBottom: 0,
      polyline: [],
      showError: false,
    };
    this.accessedLocation = false;
    this.animated = false;
    this.animatedToMarker = false;
    this.animatedMap = undefined;
    this.description = '';
    this.done = [];
    this.markers = [];
    this.mounted = false;
    this.realm = new Realm();
    this.timeout = null;
    this.timersArray = [];
    this.timersTimeout = null;
  }

  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/blue-pin-icon.png')} />
    )
  };

  render() {
    return (
      <View style={styles.container}>

        { this.props.navigation.state.params && this.props.navigation.state.params.timerCreatedAt ?
          <StaticNavigation
            navigation={this.props.navigation}
            title={'Map View'}
            timerList={true}
          />
          :
          <Navigation
            navigation={this.props.navigation}
            title={'Map View'}    
          />
        }

        <LocationView description={this.state.description} fadeDescription={this.state.fadeDescription}/>

        <AnimatedMap
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
          }}
        >

            { this.markers.length ? this.markers : this._getMarkers() }
            { this.state.polyline[0] }

        </AnimatedMap>

        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' 
        />

        <ErrorMessage checkLocationAndRender={this.checkLocationAndRender.bind(this)} showError={this.state.showError}/>
      </View>
    );
  }

  componentWillMount() {
    if (new Date() - this.realm.objects('Coordinates')[0].time > 150000) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.accessedLocation = true;
          var latitude = parseFloat(position.coords.latitude);
          var longitude = parseFloat(position.coords.longitude);

          if (!this.props.navigation.state.params  || !this.realm.objects('Timers')[this.props.navigation.state.params.timersIndex].list[0].latitude) {
            if (this.animatedMap) {
              this._animateToCoords(latitude, longitude);
            } else {
              setTimeout(() => this.mounted && this._animateToCoords(latitude, longitude), 1500);
            }
          }
        }, () => {},
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    }
  }

  componentDidMount() {
    this.mounted = true;
    // this._getMarkers() called once in render function
    this._checkAndGetCoordinates();
    this._checkAndDrawPolyline();
    setTimeout(() => {
      if (!this.animatedToMarker && !this.description) {
        this._displayDescription('No location reminders found.', true);
      } else if (!this.animatedToMarker && this.description) {
        this._displayDescription(this.description);
      } else if (this.props.navigation.state.params && this.description) {
        this._displayDescription(this.description);
      }

      if (!this.animatedToMarker && !this.accessedLocation) this.mounted && this.setState({showError: true, animating: false, mapPositionBottom: 10});
    }, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    clearTimeout(this.timerTimeout);
    this.mounted = false;
    if (this.props.navigation.state.params) {
      // Remove params for fresh state when main Map Button is pressed
      this.props.navigation.state.params = undefined;
    }
  }

  async _checkAndGetCoordinates() {
    if (this.props.navigation.state.params && typeof this.props.navigation.state.params.timersIndex === 'number') {
      this.timersArray = this.realm.objects('Timers')[this.props.navigation.state.params.timersIndex].list;
      if (this.props.navigation.state.params.timerCreatedAt) {
        for (let i = 0; i < this.timersArray.length; i++) {
          if (this.timersArray[i].createdAt === this.props.navigation.state.params.timerCreatedAt) {
            this.animatedToMarker = true;
            this.mounted && this._animateToCoords(this.timersArray[i].latitude, this.timersArray[i].longitude);
            this.done.push(true);
            return;
          }
        }
      } else {
        if (this.timersArray[0].latitude) {
          this.mounted && this._animateToCoords(this.timersArray[0].latitude, this.timersArray[0].longitude);
          this.animatedToMarker = true;
          this.done.push(true);
          return;
        } else {
          for (let i = 1; i < this.timersArray.length; i++) {
            if (this.timersArray[i].latitude) {
              this.animatedToMarker = true;
              this.timeout = setTimeout(() => {
                this.mounted && this._animateToCoords(this.timersArray[i].latitude, this.timersArray[i].longitude);
              }, 1500);
              this.done.push(true);
              return;
            }
          }
        }
      }
    }
    if (this.props.screenProps.locationReminder && !this.accessedLocation) this.checkLocationAndRender();
  }

  _checkAndDrawPolyline() {
    if (this.timersArray.length) {
      var coords = [];
      this.timersArray.forEach( timer => {
        coords.push({
          'latitude': timer.latitude,
          'longitude': timer.longitude,
        });
      });
      this.mounted && this.setState({
        polyline: [
          <Polyline
            coordinates={coords}
            strokeWidth={5}
            strokeColor='red'
            key={1}
          />
        ]
      });
      this.done.length === 2 ? this.timersArray = [] : this.done.push(true);
      return;
    }
  }

  _animateToCoords(lat: number, long: number) {
    this.mounted && this.animatedMap._component.animateToCoordinate({
      latitude: lat,
      longitude: long,
    }, 1500);
    if (!this.animated) this.animated = true;
    if (this.state.animating) this.mounted && this.setState({animating: false});
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
    this.mounted && this.setState({description, fadeDescription});
    if (fadeDescription) setTimeout(() => this.mounted && this.setState({fadeDescription: false}), 7800);
  }

  _getMarkers() {
    var lat, long, aux;
    var soonest = Number.POSITIVE_INFINITY;
    if (!this.props.navigation.state.params) {
      var lists = this.realm.objects('Timers');
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
              key={timerList.list[0].createdAt} 
            >
              <CustomCallout timer={timerList.list[0]} title="1st"/>
            </Marker>
          );
        }

        if (lists[idx+1] === undefined) {
          if (lat > 0) {
            this.animatedToMarker = true;
            this.timeout = setTimeout(() => {
              this._animateToCoords(lat, long);
            }, 1500);
          }
        }
      });
      return this.markers;
    } else {
      // Else check timers in params
      if (!this.timersArray.length) this.timersArray = this.realm.objects('Timers')[this.props.navigation.state.params.timersIndex].list;
      
      if (this.props.navigation.state.params.timerCreatedAt) {
        for (let i = 0; i < this.timersArray.length; i++) {
          if (this.timersArray[i].createdAt === this.props.navigation.state.params.timerCreatedAt) {
            this.description = this.timersArray[i].description ? this.timersArray[i].description : '';
            
            this.markers.push(
              <Marker draggable
                coordinate={{latitude: this.timersArray[i].latitude, longitude: this.timersArray[i].longitude}}
                onPress={() => this._displayDescription(this.timersArray[i].description)}
                onDragEnd={(e) => this._resetTimerCoords(this.timersArray[i].index, e.nativeEvent.coordinate, i)}
                key={this.timersArray[i].createdAt} 
              >
                <CustomCallout timer={this.timersArray[i]} title="1st" />
              </Marker>
            );
            if (this.timersArray[i].latitude) {
              this.animatedToMarker = true;
              this.timeout = setTimeout(() => {
                this._animateToCoords(this.timersArray[i].latitude, this.timersArray[i].longitude);
              }, 1500);
            }
            break;
          }
        }
      } else {

        this.description = this.timersArray[0].description ? this.timersArray[0].description : '';

        this.markers.push(
          <Marker draggable
            coordinate={{latitude: this.timersArray[0].latitude, longitude: this.timersArray[0].longitude}}
            onPress={() => this._displayDescription(this.timersArray[0].description)}
            onDragEnd={(e) => this._resetTimerCoords(this.timersArray[0].index, e.nativeEvent.coordinate, 0)}
            key={this.timersArray[0].createdAt} 
          >
            <CustomCallout timer={this.timersArray[0]} title="1st" />
          </Marker>
        );
        this.timersArray.forEach((timer, idx) => {
          if (idx !== 0) {
            if (!this.description && timer.description) this.description = timer.description;
            if (timer.latitude) {
              this.markers.push(
                <Marker draggable
                  coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
                  onPress={() => this._displayDescription(timer.description)}
                  onDragEnd={(e) => this._resetTimerCoords(this.timersArray[idx].index, e.nativeEvent.coordinate, idx)}
                  key={timer.createdAt} 
                >
                  <CustomCallout timer={timer} secondary={true}/>
                </Marker>
              );
            }
          }
        });

        if (this.timersArray[0].latitude) {
          this.animatedToMarker = true;
          this.timeout = setTimeout(() => {
            this._animateToCoords(this.timersArray[0].latitude, this.timersArray[0].longitude);
          }, 1500);
        } else { // Try to find the first timer with recorded coordinates and animate there
          for (let i = 1; i < this.timersArray.length; i++) {
            if (this.timersArray[i].latitude) {
              this.animatedToMarker = true;
              this.timeout = setTimeout(() => {
                this._animateToCoords(this.timersArray[i].latitude, this.timersArray[i].longitude);
              }, 1500);
              break;
            }
          }
        }
      }
      this.timersTimeout = setTimeout(() => this.timersArray = [], 3000);
    }
    this.done.length === 2 ? this.timersArray = [] : this.done.push(true);
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
          if (!this.state.animating) this.mounted && this.setState({animating: true});
          this.accessedLocation = true;
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude);
          this.mounted && this._animateToCoords(latitude, longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = latitude;
            this.realm.objects('Coordinates')[0].longitude = longitude;
          });
          if (this.mounted && this.state.showError) {
            if (this.state.description === 'No location reminder found.' && !this.state.fadeDescription) {
              this._displayDescription(this.state.description, true);
            }
            this.mounted && this.setState({showError: false, mapPositionBottom: 0});
          }
        }, () => {
          if (!this.state.showError) this.mounted && this.setState({showError: true, mapPositionBottom: 10});
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    });
  }
}

MapApp.propTypes = {
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired,
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
