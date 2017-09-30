import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

import MapView, { Marker } from 'react-native-maps';
import {
  primaryBlue,
  mediumFontSize,
  pinHeight,
  pinWidth,
  screenHeight,
} from '../../styles/common';

/* global require */
export default class MapModal extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => this.props.closeModal()}
        visible={this.props.visibility} >
        <TouchableOpacity
          style={styles.closeContainer}
          onPress={() => this.props.closeModal()}>

        </TouchableOpacity>
        <View style={styles.mapContainer}>
          <MapView.Animated
            ref={ref => { this.animatedMap = ref; }}
            style={styles.map}
            mapType="hybrid"
            showsUserLocation={true}
            initialRegion={{
              latitude: this.props.latitude ? this.props.latitude : 37.78926,
              longitude: this.props.longitude ? this.props.longitude : -122.43159,
              latitudeDelta: 0.0108,
              longitudeDelta: 0.0060,
            }} >

            <Marker
              coordinate={{
                latitude: this.props.latitude,
                longitude: this.props.longitude}} >
              <Image
                source={require('../../../../shared/images/blue-pin.png')}
                style={styles.pinIcon}/>
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
      bottom: screenHeight - 250,
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
    top: 250,
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
    bottom: '7%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
  },
  location: {
    textAlign: 'center',
    color: primaryBlue,
    fontSize: mediumFontSize,
    paddingLeft: '3%',
    paddingRight: '3%',
    paddingBottom: '1.5%',
    paddingTop: '1.5%',
  },
  pinIcon: {
    height: pinHeight,
    width: pinWidth, 
  },
});
