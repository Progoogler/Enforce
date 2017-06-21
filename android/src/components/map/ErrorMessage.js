import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';


const ErrorMessage = (props) => (
  <TouchableWithoutFeedback onPress={() => props.checkLocationAndRender()}>
    <View style={styles.container}>
      <Text style={styles.message}> Location not accessible. Please try <Text style={styles.again}>again.</Text></Text>
    </View>
  </TouchableWithoutFeedback>
);

ErrorMessage.propTypes = {
  checkLocationAndRender: PropTypes.func.isRequired
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  message: {
    padding: 18,
    fontSize: 16,
  },
  again: {
    color: '#4286f4',
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
}

export default ErrorMessage;
