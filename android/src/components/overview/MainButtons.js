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
            underlayColor='#4286f4'
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
            underlayColor='#4286f4'
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

  _onShowUnderlay(button) {
    button === 'map' ? this.setState({mapUnderline: true}) : this.setState({cameraUnderline: true});
  }

  _onHideUnderlay(button) {
    button === 'map' ? this.setState({mapUnderline: false}) : this.setState({cameraUnderline: false});
  }
}

const styles = StyleSheet.create({
  mainButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  },
  buttonColumn: {
    flex: .5,
    flexDirection: 'column',
  },
  underline: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderWidth: 5,
    borderColor: 'white',
  },
  button: {
    height: 70,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .35,
    height: 35,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 18,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
  }
});
