import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const Warning = (props) => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.warning}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    marginRight: 60,
    marginTop: -10,
  },
  text: {
    color: 'red',
  },
});

export default Warning;
