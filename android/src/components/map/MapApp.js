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
import { connect } from 'react-redux';

export default class MapApp extends Component {
  constructor() {
    super();
    // this.realm = new Realm({
    //   schema: [{name: 'Dog', properties: {name: 'string'}}, TimerSchema, CameraTimeSchema, TimerListSchema, TimerCountSchema]
    // });
    this.state = {
      animating: true,
    };
    this.animatedMap = undefined;
    this.latitude = undefined;
    this.longitude = undefined;
    this.markers = [];
    this.realm = new Realm();
  }
  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../parked_logo_72x72.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    )
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        let latitude = parseFloat(position.coords.latitude);
        let longitude = parseFloat(position.coords.longitude);
        this._animateToCoord(latitude, longitude);
      }, error => {
        this.retryGeolocation();
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  render() {
    return (
      <View style={styles.container} >
        <View
          style={{position: 'absolute', zIndex: 1, top: 0, left: 0, right: 0}} >
          <Button
            onPress={() => {
              console.log('Timers obj', this.realm.objects('Timers').length, this.realm.objects('Timers'));
            }}
            title="Increment" />
        </View>

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
    const context = this;
    const markers = [];
    this.realm.objects('Timers').forEach(timerList => {
      timerList.list.forEach(list => {
        markers.push(<MapView.Marker
          coordinate={{latitude: list.latitude, longitude: list.longitude}}
        />);
      });
    });
    console.log('markers array', markers)
    //setTimeout(() => { this.animatedMap._component.fitToSuppliedMarkers(markers, true) }, 5000);
    return markers;
  }
}

// export default connect(state => {
//   return state;
// }, null)(MapApp);

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
