import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import { primaryBlue, mainButtonsHeight } from '../../styles/common';

/* global require */
export default class MainButtons extends Component {
  constructor() {
    super();
    this.state = {
      cameraBorder: primaryBlue,
      mapBorder: primaryBlue,
    }
  }

  render() {
    return (
      <View style={styles.mainButtonsContainer}>

        <View style={styles.buttonColumn}>
          <TouchableHighlight
            onHideUnderlay={() => {this._onHideUnderlay('map')}}
            onPress={() => this.props.navigation.navigate('Map')} 
            onShowUnderlay={() => {this._onShowUnderlay('map')}}
            style={{
              alignItems: 'center',
              borderBottomColor: this.state.mapBorder,
              borderBottomWidth: 4,
              height: mainButtonsHeight,
              justifyContent: 'center',
            }}
            underlayColor={primaryBlue}
          >
            <Image source={require('../../images/white-pin.jpg')}/>
          </TouchableHighlight>
          { this.state.mapUnderline ? <View style={styles.underline} /> : null }
        </View>

        <View style={styles.separator}/>

        <View style={styles.buttonColumn}>
          <TouchableHighlight
            onHideUnderlay={() => {this._onHideUnderlay('camera')}}
            onShowUnderlay={() => {this._onShowUnderlay('camera')}}
            onPress={() => this.props.navigation.navigate('Camera')}
            style={{
              alignItems: 'center',
              borderBottomColor: this.state.cameraBorder,
              borderBottomWidth: 4,
              height: mainButtonsHeight,
              justifyContent: 'center',
            }}
            underlayColor={primaryBlue}
          >
            <Image source={require('../../images/camera.png')}/>
          </TouchableHighlight>
          { this.state.cameraUnderline ? <View style={styles.underline} /> : null }
        </View>

      </View>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.cameraBorder !== nextState.cameraBorder) return true;
    if (this.state.mapBorder !== nextState.mapBorder) return true;
    return false;
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
    alignItems: 'center',
    backgroundColor: primaryBlue,
    flexDirection: 'row',
  },
  buttonColumn: {
    flex: .5,
    flexDirection: 'column',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .35,
    height: '45%',
  },
});
