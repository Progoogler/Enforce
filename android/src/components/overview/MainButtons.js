import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue, mainButtonsHeight } from '../../styles/common';

/* global require */
export default class MainButtons extends Component {
  constructor() {
    super();
    this.state = {
      mapBorder: primaryBlue,
      cameraBorder: primaryBlue,
    }
  }

  render() {
    return (
      <View style={styles.mainButtonsContainer}>

        <View style={styles.buttonColumn}>
          <TouchableHighlight
            style={{
              height: mainButtonsHeight,
              borderBottomWidth: 4,
              borderBottomColor: this.state.mapBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
            style={{
              height: mainButtonsHeight,
              borderBottomWidth: 4,
              borderBottomColor: this.state.cameraBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
    button === 'map' ? this.setState({mapBorder: 'white'}) : this.setState({cameraBorder: 'white'});
  }

  _onHideUnderlay(button: string) {
    button === 'map' ? this.setState({mapBorder: primaryBlue}) : this.setState({cameraBorder: primaryBlue});
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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .35,
    height: '45%',
  },
});
