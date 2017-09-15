import React, { Component } from 'react';
import {
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { extraLargeFontSize } from '../../styles/common';

export default class Notification extends Component {
  constructor() {
    super();
    this.fadeAnim = new Animated.Value(0);
  }

  render() {
    return (
      <Animated.View style={{
          opacity: this.fadeAnim,
        }} >
        <Text style={styles.text} >New Timer</Text>
      </Animated.View>
    );
  }

  componentDidMount() {
    Animated.timing(  // Animate over time
      this.fadeAnim,  // The animated value to drive
      { toValue: 1 },  // Animate to opacity: 1, or fully opaque
    ).start();
    setTimeout(() => {
      Animated.timing(
        this.fadeAnim,
        { toValue: 0,
          duration: 500, },
      ).start();
    }, 1000);
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'rgba(255, 255, 255, 1.0)',
    fontWeight: 'bold',
    fontSize: extraLargeFontSize,
  },
});
