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
      polyline: [null],
    };
    this.animated = false;
    this.animatedMap = undefined;
    this._dragTimerIndex = undefined;
    this._timerSecondaryIndex = undefined;
    this.realm = new Realm();
  }

  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/blue-pin-icon.jpg')} />
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

  async componentWillMount() {
    this._mounted = true;
    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);

    if (settings && settings.location) {
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
          }, () => {
            this._mounted && this.setState({showError: true, animating: false});
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
        );
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude);
          this._animateToCoord(latitude, longitude);
          this.realm.write(() => {
            this.realm.objects('Coordinates')[0].latitude = latitude;
            this.realm.objects('Coordinates')[0].longitude = longitude;
          });
        }, () => {
          this._mounted && this.setState({showError: true, animating: false});
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    }
  }

  componentDidMount() {
    if (this.props.navigation.state.params) {
      let coords = [];
      this.props.navigation.state.params.timers.forEach( timer => {
        coords.push({
          'latitude': timer.latitude,
          'longitude': timer.longitude,
        });
      });
      if (!this.props.navigation.state.params.timers[0].description) {
        this.setState({
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
        this.setState({
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

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._mounted = false;
    if (this.props.navigation.state.params) {
      // Remove params for fresh state when main Map Button is pressed
      this.props.navigation.state.params = undefined;
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

  setMarkers() {
    this.animatedMap._component.fitToSuppliedMarkers(this.markers);
  }

  _resetTimerCoords(coords) {
    // @params coords: object {longitude: -122.000, latitude: 37.000}.
    this.realm.write(() => {
      this.realm.objects('Timers')[this._dragTimerIndex].list[this._timerSecondaryIndex ? this._timerSecondaryIndex : 0].latitude = coords.latitude;
      this.realm.objects('Timers')[this._dragTimerIndex].list[this._timerSecondaryIndex ? this._timerSecondaryIndex : 0].longitude = coords.longitude;
    });
  }

  _matchTimerCoords(coords: object, secondaryMarker?: boolean) { // Potentially inaccurate match w/o longitude difference as well from origin.
    let latDiff, longDiff; // @params *Diff: difference value b/w latitudes.
    let index;

    if (secondaryMarker && this._dragTimerIndex) {
      this.realm.objects('Timers')[this._dragTimerIndex].list.forEach((timer, idx) => {
        let latComp = timer.latitude - coords.latitude;
        let longComp = timer.longitude - coords.longitude;
        if (latComp < 0) {
          latComp = coords.latitude - timer.latitude;
        }
        if (longComp > 0) {
          longComp = coords.longitude - timer.longitude;
        }
        if (!latDiff) {
          index = idx;
          latDiff = latComp;
          longDiff = longComp;
        } else {
          if (latComp < latDiff && longComp > longDiff) {
            latDiff = latComp;
            longDiff = longComp;
            index = idx;
          }
        }
      });
      this._timerSecondaryIndex = index;
      return;
    } else {
      this.realm.objects('Timers').forEach((timerList, idx) => {

        if (!timerList.list[0]) return; // Do not evaluate empty lists.

        if (secondaryMarker && timerList.list[0].createdAt === this.props.navigation.state.params.timers[0].createdAt) {

          this._dragTimerIndex = idx; // Keep track to prevent first loop from double checking.
          this.props.navigation.state.params.timers.forEach((timer, sidx) => {
            let latComp = timer.latitude - coords.latitude;
            let longComp = timer.longitude - coords.longitude;
            if (latComp < 0) {
              latComp = coords.latitude - timer.latitude;
            }
            if (longComp > 0) {
              longComp = coords.longitude - timer.longitude;
            }
            if (!latDiff) {
              index = sidx;
              latDiff = latComp;
              longDiff = longComp;
            } else {
              if (latComp < latDiff && longComp > longDiff) {
                latDiff = latComp;
                longDiff = longComp;
                index = sidx;
              }
            }
          });
          this._timerSecondaryIndex = index;
          return;
        } else if (secondaryMarker) {
          return;
        } else {

          // @params comp: comparison value
          let latComp = timerList.list[0].latitude - coords.latitude;
          let longComp = timerList.list[0].longitude - coords.longitude;
          if (latComp < 0) {
            latComp = coords.latitude - timerList.list[0].latitude;
          }
          if (longComp > 0) {
            longComp = coords.latitude - timerList.list[0].longitude;
          }
          if (!latDiff) {
            index = idx;
            latDiff = latComp;
            longDiff = longComp;
          } else {
            if (latComp < latDiff && longComp > longDiff) {
              latDiff = latComp;
              longDiff = longComp;
              index = idx;
            }
          }
        }
      });
      if (!secondaryMarker) this._dragTimerIndex = index;
    }
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
          aux = timerList.list[0].createdAt + (timerList.list[0].timeLength * 60 * 60 * 1000);
          if (aux < soonest) {
            soonest = aux;
            lat = timerList.list[0].latitude !== 0 ? timerList.list[0].latitude : lat;
            long = timerList.list[0].longitude !== 0 ? timerList.list[0].longitude : long;
          }
          markers.push(
            <Marker draggable
              coordinate={{latitude: timerList.list[0].latitude, longitude: timerList.list[0].longitude}}
              onDragStart={(e) => this._matchTimerCoords(e.nativeEvent.coordinate)}
              onDragEnd={(e) => this._resetTimerCoords(e.nativeEvent.coordinate)}
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
          onDragStart={(e) => this._matchTimerCoords(e.nativeEvent.coordinate, true)}
          onDragEnd={(e) => this._resetTimerCoords(e.nativeEvent.coordinate)}
          key={arr[0].createdAt} >
          <CustomCallout timer={arr[0]} title="1st" />
        </Marker>
      );
      arr.forEach((timer, idx) => {
         if (idx !== 0) {
           markers.push(<Marker draggable
             coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
             onDragStart={(e) => this._matchTimerCoords(e.nativeEvent.coordinate, true)}
             onDragEnd={(e) => this._resetTimerCoords(e.nativeEvent.coordinate)}
             key={timer.createdAt} >
             <CustomCallout timer={arr[idx]} secondary={true}/>
            </Marker>
           );
         }
      });
      if (arr[0].latitude > 0) {
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
          this._mounted && this.setState({showError: false, animating: false});
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
