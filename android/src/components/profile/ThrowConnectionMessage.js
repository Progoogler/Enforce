import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { primaryBlue, smallFontSize } from '../../styles/common';

const ThrowConnectionMessage = () => (
  <View style={styles.container}>
    <Text style={styles.message}>Must be connected to the Internet.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    borderTopWidth: 2,
    borderColor: primaryBlue,
  },
  message: {
    padding: '5%',
    fontSize: smallFontSize,
  },
});


export default ThrowConnectionMessage;
