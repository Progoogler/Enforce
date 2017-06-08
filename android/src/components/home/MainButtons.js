import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  //Animated,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';


export default class MainButtons extends Component {
  constructor() {
    super();
    this.state = {
      //separatorHeight: new Animated.Value(40),
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

  // <Animated.View style={{
  //     borderColor: 'white',
  //     borderWidth: .5,
  //     height: this.state.separatorHeight,
  //   }}></Animated.View>

  // componentWillUpdate() {
  //   if (this.props.searching) {
  //     Animated.timing(
  //       this.state.separatorHeight,
  //       { toValue: 0,
  //         duration: 10, },
  //     ).start();
  //   } else {
  //     Animated.timing(
  //       this.state.separatorHeight,
  //       { toValue: 40,
  //         duration: 10, },
  //     ).start();
  //   }

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
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .35,
    height: 35,
  },
  mapPressed: {
    flex: .5,
    height: 60,
    paddingBottom: 10,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderColor: 'white',
  },
  cameraPressed: {
    flex: .5,
    height: 60,
    paddingBottom: 10,
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
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
  }
});
