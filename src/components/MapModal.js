import React, { Component } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import { Animated as AnimatedMap, Marker } from 'react-native-maps';
import Navigation from './StaticNavigation';
import PropTypes from 'prop-types';

import LocationView from './LocationView';
import { navBarContainerHeight } from '../styles/common';

/*global require*/
export default class MapModal extends Component {
  constructor() {
    super();
    this.state = {
      animating: true,
      description: '',
      marker: [],
    };
  }

  render() {
    return (
      <Modal
        animationType={"fade"}
        onRequestClose={() => this.props.closeModal()}
        transparent={false}
        visible={this.props.visibility} 
      >

        <Navigation 
         closeModal={this.props.closeModal} 
         title={'History'} 
        />

        <LocationView description={this.state.description}/>

        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' 
        />

        <View style={styles.mapContainer}>

          <AnimatedMap
            initialRegion={{
              latitude: this.props.latitude !== 0 ? this.props.latitude : 37.78926,
              longitude: this.props.longitude !== 0 ? this.props.longitude : -122.43159,
              latitudeDelta: 0.0108,
              longitudeDelta: 0.0060,
            }} 
            mapType="hybrid"
            ref={ref => {this.animatedMap = ref;}}
            showsUserLocation={true}
            style={styles.map}
          >

            { 
              this.state.marker.length ? 
              this.state.marker 
              :
              <Marker
                coordinate={{
                  latitude: this.props.latitude,
                  longitude: this.props.longitude
                }} 
                mapModalAnimating={this.mapModalAnimating.bind(this)}
              >
                <Image source={require('../images/blue-pin.png')}/>
              </Marker>
            }

          </AnimatedMap>

        </View>
      </Modal>
    );
  }

  componentDidMount() {
    this.props.description.length === 0 ? this.setState({description: 'No location reminder found.'}) : this.setState({description: this.props.description});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.description && this.state.description === '') this.setState({description: nextProps.description});
    if (nextProps.latitude) {
      this.setState({marker: [
        <Marker
          mapModalAnimating={this.mapModalAnimating.bind(this)}
          coordinate={{
            latitude: this.props.latitude,
            longitude: this.props.longitude}} 
            key={1}
          >
          <Image source={require('../images/blue-pin.png')}/>
        </Marker>
      ]});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.visibility !== nextProps.visibility) return true;
    if (this.state.animating !== nextState.animating) return true;
    if (this.state.marker.length !== nextState.marker.length) return true;
    if (this.props.description !== nextProps.description) return true;
    return false;
  }

  mapModalAnimating() {
    this.setState({animating: false});
  }

}

MapModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  description: PropTypes.string,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  visibility: PropTypes.bool.isRequired,
}

const styles = StyleSheet.create({
  mapContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
    top: navBarContainerHeight,
  },
  map: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 8,
  },
  activity: {
    flex: 1,
    zIndex: 8,
  },
});
 