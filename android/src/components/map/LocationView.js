import React, { Component } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';

import { mediumFontSize, navBarContainerHeight, primaryBlue } from '../../styles/common';

export default class LocationView extends Component {
  constructor() {
    super();
    this.state = {
      description: '',
    };
    this.top = new Animated.Value(0);
  }

  render() {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          height: navBarContainerHeight,
          backgroundColor: 'white',
          justifyContent: 'center',
          borderBottomWidth: 2,
          borderColor: primaryBlue,
          top: this.top,
          left: 0,
          right: 0,
          zIndex: 9,
          paddingLeft: '2%',
          paddingRight: '2%',
        }}>
        <TouchableWithoutFeedback
          onPress={() => this._hideAnimatedView()}
          >
        <View><Text style={styles.description}> { this.state.description } </Text></View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.description.length !== 0) {
      this.setState({description: nextProps.description});
      this._displayAnimatedView();
    }
  }

  _displayAnimatedView() {
    Animated.timing(
      this.top,
      { toValue: navBarContainerHeight,
        duration: 1000 },
    ).start();
  }

  _hideAnimatedView() {
    Animated.timing(
      this.top,
      { toValue: 0,
        duration: 1000 },
    ).start();
  }

  // _prettyMessage(string) { // Breaks a line around ~40 characters
  //   if (string.length > 45) {
  //     let arr = string.split('');
  //     for (let i = 40; i < arr.length; i++) {
  //       if (arr[i] === ' ') {
  //         arr.splice(i, 0, '\n');
  //         return arr.join('');
  //       }
  //     }
  //   }
  //   return string;
  // }
}

const styles = StyleSheet.create({
  description: {
    textAlign: 'center',
    fontSize: mediumFontSize,
    color: primaryBlue,
  }
})
