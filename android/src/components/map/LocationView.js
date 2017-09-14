import React, { Component } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';

import { mediumFontSize, navBarContainerHeight, fadeContainerHeight, primaryBlue } from '../../styles/common';
// var fadeContainerHeight = navBarContainerHeight + 20;

export default class LocationView extends Component {
  constructor() {
    super();
    this.state = {
      description: '',
      fadeDescription: false,
    };
    this.top = new Animated.Value(-30);
  }

  render() {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: this.top,
          left: 0,
          right: 0,
          zIndex: 9,
        }}>

          <TouchableWithoutFeedback style={styles.touchable} onPress={() => this._hideAnimatedView()}>
            <View style={styles.textContainer}>
              <Text style={styles.description}> { this.state.description } </Text>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={() => this._hideAnimatedView()}>
            <View style={styles.circle}></View>
          </TouchableWithoutFeedback>

      </Animated.View>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.description.length !== 0) {
      this.setState({description: nextProps.description, fadeDescription: nextProps.fadeDescription});
      this._displayAnimatedView()
      if (nextProps.fadeDescription) setTimeout(() => this._hideAnimatedView(), 8000);
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
      { toValue: -30,
        duration: 1000 },
    ).start();
  }
}

const styles = StyleSheet.create({
  textContainer: {
    zIndex: 9,
    height: navBarContainerHeight,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: primaryBlue,
    paddingLeft: '3%',
    paddingRight: '3%',
  },
  description: {
    textAlign: 'center',
    fontSize: mediumFontSize,
    color: primaryBlue,
  },
  touchable: {
    height: navBarContainerHeight + 10,
    width: '100%',
  },
  circle: {
    alignSelf: 'center',
    zIndex: 8,
    marginTop: -20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: primaryBlue,
    transform: [
      {scaleX: 2}
    ],
  }
});
