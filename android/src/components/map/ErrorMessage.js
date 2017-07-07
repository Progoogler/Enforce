import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue, mediumFontSize } from '../../styles/common';

const ErrorMessage = (props) => (
  <TouchableWithoutFeedback onPress={() => props.checkLocationAndRender()}>
    <View style={styles.container}>
      <Text style={styles.message}> Location not accessible. Please try <Text style={styles.again}>again.</Text></Text>
    </View>
  </TouchableWithoutFeedback>
);

ErrorMessage.propTypes = {
  checkLocationAndRender: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    padding: '3.5%',
    zIndex: 10,
    borderTopWidth: 2,
    borderColor: primaryBlue,
  },
  message: {
    fontSize: mediumFontSize,
  },
  again: {
    color: primaryBlue,
  },
});

export default ErrorMessage;
