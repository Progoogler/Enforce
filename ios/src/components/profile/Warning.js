import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

const Warning = (props) => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.warning}</Text>
  </View>
);

Warning.propTypes = { warning: PropTypes.string.isRequired }

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginLeft: 170,
    marginTop: -10,
  },
  text: {
    color: 'red',
  },
});

export default Warning;
