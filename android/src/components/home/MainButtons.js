import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';


export default class MainButtons extends Component {
  constructor() {
    super();
    this.state = {
      map: false,
      camera: false,
    }
  }

  render() {
    return (
      <View style={styles.mainButtonsContainer}>
        <TouchableHighlight
          style={ this.state.map ? styles.mapPressed : styles.button }
          onHideUnderlay={() => {this._onHideUnderlay('map')}}
          onShowUnderlay={() => {this._onShowUnderlay('map')}}
          onPress={() => this.props.navigation.navigate('Map')} >
          <Image source={require('../../../../shared/images/white-pin.jpg')} />
        </TouchableHighlight>
        <View style={styles.separator} />
        <TouchableHighlight
          style={ this.state.camera ? styles.cameraPressed : styles.button }
          onHideUnderlay={() => {this._onHideUnderlay('camera')}}
          onShowUnderlay={() => {this._onShowUnderlay('camera')}}
          onPress={() => this.props.navigation.navigate('Camera')} >
          <Image source={require('../../../../shared/images/camera.png')} />
        </TouchableHighlight>
      </View>
    );
  }

  _onShowUnderlay(button) {
    button === 'map' ? this.setState({map: true}) : this.setState({camera: true});
  }

  _onHideUnderlay(button) {
    button === 'map' ? this.setState({map: false}) : this.setState({camera: false});
  }
}

const styles = StyleSheet.create({
  mainButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  },
  button: {
    flex: .5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPressed: {
    flex: .5,
    height: 70,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderColor: 'white',
  },
  cameraPressed: {
    flex: .5,
    height: 70,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderColor: 'white',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 18,
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
    height: 40,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
  }
});
