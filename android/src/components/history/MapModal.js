import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

import MapView, { Marker } from 'react-native-maps';
import Navigation from '../navigation/StaticNavigation';
import {
  primaryBlue,
  mediumFontSize,
} from '../../styles/common';

const height = Dimensions.get('window').height;

/*global require*/
export default class MapModal extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal
        animationType={"fade"}
        transparent={false}
        onRequestClose={() => this.props.closeModal()}
        visible={this.props.visibility} >

        <TouchableOpacity
          activeOpacity={1}
          style={styles.closeContainer}
          onPress={() => this.props.closeModal()}>

          <Navigation title={'Map View'} closeModal={this.props.closeModal} />

        </TouchableOpacity>

        <View style={styles.mapContainer}>
          <MapView.Animated
            ref={ref => { this.animatedMap = ref; }}
            style={styles.map}
            mapType="hybrid"
            showsUserLocation={true}
            initialRegion={{
              latitude: this.props.latitude !== 0 ? this.props.latitude : 37.78926,
              longitude: this.props.longitude !== 0 ? this.props.longitude : -122.43159,
              latitudeDelta: 0.0108,
              longitudeDelta: 0.0060,
            }} >

            <Marker
              coordinate={{
                latitude: this.props.latitude,
                longitude: this.props.longitude}} >
              <Image source={require('../../../../shared/images/blue-pin.png')} />
            </Marker>

          </MapView.Animated>
          { this.props.description ?
              <View style={styles.locationContainer}>
                <Text style={styles.location}>{this.props.description}</Text>
              </View>
            : null }
        </View>
      </Modal>
    );
  }

  componentWillMount() {
    styles.closeContainer = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: height - 100,
    }
  }

}

MapModal.propTypes = {
  visibility: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  description: PropTypes.string,
}

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    top: 60,
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
  locationContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    paddingTop: 2,
    paddingBottom: 2,
    zIndex: 100,
  },
  location: {
    textAlign: 'center',
    color: primaryBlue,
    fontSize: mediumFontSize,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 4,
    paddingTop: 4,
  },
});
