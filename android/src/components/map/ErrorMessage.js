import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const ErrorMessage = () => (
  <View style={styles.container}>
    <Text style={styles.message}> Location not accessible. Please try again later. </Text>
  </View>
);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  message: {
    padding: 18,
    fontSize: 16,
  }
});

styles.container = {
  position: 'absolute',
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  width: width,
  zIndex: 10,
  borderTopWidth: 2,
  borderColor: '#4286f4',
}

export default ErrorMessage;
