import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const Wait = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Please wait</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    borderColor: '#4286f4',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,

  },
  text: {
    color: '#4286f4',
  },
});

export default Wait;
