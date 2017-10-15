import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
} from 'react-native';
import { extraLargeFontSize } from '../../styles/common';
 
export default class Notification extends Component {
  constructor() {
    super();
    this.fadeAnim = new Animated.Value(0);
  }

  render() { console.log('notification renders')
    return (
      <Animated.View 
        style={{
          opacity: this.fadeAnim
        }} 
      >
        <Text style={styles.text}>New Timer</Text>
      </Animated.View>
    );
  }

  componentDidMount() {
    Animated.timing(
      this.fadeAnim, { 
        toValue: 1 
      },
    ).start();
    setTimeout(() => {
      Animated.timing(
        this.fadeAnim, { 
          toValue: 0,
          duration: 500, 
        },
      ).start();
    }, 1000);
  }

  shouldComponentUpdate() {
    return false;
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'rgba(255, 255, 255, 1.0)',
    fontSize: extraLargeFontSize,
    fontWeight: 'bold',
  },
});
