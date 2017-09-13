import React, { Component } from 'react';
import {
  View,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';

import MapView, { Marker } from 'react-native-maps';
import Navigation from '../navigation/StaticNavigation';
import LocationView from '../map/LocationView';
import {
  navBarContainerHeight,
  primaryBlue,
  mediumFontSize,
} from '../../styles/common';

/*global require*/
export default class MapModal extends Component {
  constructor() {
    super();
    this.state = {
      description: '',
      animating: true,
    };
  }

  render() {
    return (
      <Modal
        animationType={"fade"}
        transparent={false}
        onRequestClose={() => this.props.closeModal()}
        visible={this.props.visibility} >

        <Navigation title={'History'} closeModal={this.props.closeModal} />

        <LocationView description={this.state.description}/>

        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' />

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
              mapModalAnimating={this.mapModalAnimating.bind(this)}
              coordinate={{
                latitude: this.props.latitude,
                longitude: this.props.longitude}} >
              <Image source={require('../../../../shared/images/blue-pin.png')} />
            </Marker>

          </MapView.Animated>

        </View>
      </Modal>
    );
  }

  componentDidMount() {
    if (this.props.description) this.setState({description: this.props.description});
  }

  mapModalAnimating() {
    this.setState({animating: false});
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
    top: navBarContainerHeight,
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
    zIndex: 8,
  },
  activity: {
    flex: 1,
    zIndex: 8,
  },
});
