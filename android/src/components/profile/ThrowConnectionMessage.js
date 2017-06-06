import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const ThrowConnectionMessage = () => (
  <View style={styles.container}>
    <Text style={styles.message}>Must be connected to the Internet.</Text>
  </View>
);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  message: {
    padding: 18,
    fontSize: 16,
  },
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
};

export default ThrowConnectionMessage;
