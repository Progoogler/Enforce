import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { primaryBlue, smallFontSize } from '../../styles/common';

const ThrowConnectionMessage = () => (
  <View style={styles.container}>
    <Text style={styles.message}>Must be connected to the Internet</Text>
  </View>
);
 
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 2,
    borderColor: primaryBlue,
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    zIndex: 10,
  },
  message: {
    fontSize: smallFontSize,
    padding: '5%',
  },
});

export default ThrowConnectionMessage;
