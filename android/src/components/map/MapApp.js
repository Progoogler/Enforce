import React, { Component } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  View,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import Realm from 'realm';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import Navigation from '../navigation/StaticNavigation';
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
    this._dragTimerIndex = undefined;
    this.realm = new Realm();
  }

  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/blue-pin.png')}
        style={[styles.icon]}
      />
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

        { this.state.showError ? <ErrorMessage checkLocationAndRender={this.checkLocationAndRender.bind(this)} /> : <View /> }
      </View>
    );
  }

  async componentWillMount() {
    this._mounted = true;
    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);

    if (this.props.navigation.state.params) this.setModalVisible();

    if (settings.location) {
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
          }, error => {
            this._mounted && this.setState({showError: true});
            console.log('Error loading geolocation:', error);
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
        );
      });
      // .catch(() => {
      //   this._mounted && this.setState({showError: true});
      // });
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
        }, error => {
          this._mounted && this.setState({showError: true, animating: false});
          //console.warn('Error loading geolocation:', error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._mounted = false;
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
      let details = "", i = 0;
      while (details.length === 0 && i < this.props.navigation.state.params.timers.length) {
        details = this.props.navigation.state.params.timers[i].description;
        i++;
      }
      if (!details) return (<LocationDetailsView />);
    }
  }

  _animateToCoord(lat, long) {
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
      this.realm.objects('Timers')[this._dragTimerIndex].list[0].latitude = coords.latitude;
      this.realm.objects('Timers')[this._dragTimerIndex].list[0].longitude = coords.longitude;
    });
  }

  _matchTimerCoords(latitude) { // Potentially inaccurate match w/o longitude difference as well from origin.
    let diff; // @params diff: difference value b/w latitudes.
    let index;
    this.realm.objects('Timers').forEach((timerList, idx) => {
      // @params comp: comparison value
      let comp = timerList.list[0].latitude - latitude;
      if (comp < 0) {
        comp = latitude - timerList.list[0].latitude;
      }
      if (!diff) {
        index = idx;
        diff = comp;
      } else {
        if (comp < diff) {
          diff = comp;
          index = idx;
        }
      }
    });
    this._dragTimerIndex = index;
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
              onDragStart={(e) => this._matchTimerCoords(e.nativeEvent.coordinate.latitude)}
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
          key={arr[0].createdAt} >
          <CustomCallout timer={arr[0]} title="1st" />
        </Marker>
      );
      arr.forEach((timer, idx) => {
         if (idx !== 0) {
           markers.push(<Marker draggable
             coordinate={{latitude: timer.latitude, longitude: timer.longitude}}
             key={timer.createdAt} >
             <CustomCallout timer={arr[idx]} title="1st" secondary={true}/>
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
          this._mounted && this.setState({showError: false});
        }, error => {
          console.warn('Error loading geolocation:', error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000}
      );
    });
    // .catch(() => {
    //   this._mounted && this.setState({showError: true});
    // });
  }

  setModalVisible() {
    this._mounted && this.setState({modalVisible: !this.state.modalVisible});
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
