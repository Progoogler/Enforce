import React, { Component } from 'react';
//import MapView from 'react-native-maps';
import {
  View,
  Stylesheet
} from 'react-native';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <Text>Hello world</Text>
      </View>
    );
  }
}

// <MapView.Animated
//   ref={ref => { this.animatedMap = ref; }}
//   style={styles.map}
//   mapType="hybrid"
//   showsUserLocation={true}
//   initialRegion={{
//     latitude: 37.78926,
//     longitude: -122.43159,
//     latitudeDelta: 0.0048,
//     longitudeDelta: 0.0020
//   }}>
//
// </MapView.Animated>
