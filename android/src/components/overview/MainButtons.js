import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue } from '../../styles/common';

/* global require */
export default class MainButtons extends Component {
  constructor() {
    super();
    this.state = {
      map: false,
      camera: false,
      mapUnderline: false,
      cameraUnderline: false,
    }
  }

  render() {
    return (
      <View style={styles.mainButtonsContainer}>

        <View style={styles.buttonColumn}>
          <TouchableHighlight
            style={styles.button}
            underlayColor={primaryBlue}
            onHideUnderlay={() => {this._onHideUnderlay('map')}}
            onShowUnderlay={() => {this._onShowUnderlay('map')}}
            onPress={() => this.props.navigation.navigate('Map')} >
            <Image source={require('../../../../shared/images/white-pin.jpg')} />
          </TouchableHighlight>
          { this.state.mapUnderline ? <View style={styles.underline} /> : null }
        </View>

        <View style={styles.separator} />

        <View style={styles.buttonColumn}>
          <TouchableHighlight
            style={ styles.button }
            underlayColor={primaryBlue}
            onHideUnderlay={() => {this._onHideUnderlay('camera')}}
            onShowUnderlay={() => {this._onShowUnderlay('camera')}}
            onPress={() => this.props.navigation.navigate('Camera')} >
            <Image source={require('../../../../shared/images/camera.png')} />
          </TouchableHighlight>
          { this.state.cameraUnderline ? <View style={styles.underline} /> : null }
        </View>

      </View>
    );
  }

  _onShowUnderlay(button: string) {
    button === 'map' ? this.setState({mapUnderline: true}) : this.setState({cameraUnderline: true});
  }

  _onHideUnderlay(button: string) {
    button === 'map' ? this.setState({mapUnderline: false}) : this.setState({cameraUnderline: false});
  }
}

MainButtons.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  mainButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryBlue,
  },
  buttonColumn: {
    flex: .5,
    flexDirection: 'column',
  },
  underline: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderWidth: 3,
    borderColor: 'white',
  },
  button: {
    height: 70,
    paddingBottom: '2%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .35,
    height: '45%',
  },
});
