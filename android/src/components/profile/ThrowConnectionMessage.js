import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { primaryBlue, smallFontSize } from '../../styles/common';

const ThrowConnectionMessage = () => (
  <View style={styles.container}>
    <Image source={require('../../../../shared/images/internet-icon.png')}/>
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
    flexDirection: 'row',
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
