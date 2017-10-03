import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { smallFontSize, textInputWidth } from '../../styles/common';

const Warning = (props) => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.warning}</Text>
  </View>
);

Warning.propTypes = { warning: PropTypes.string.isRequired }

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: textInputWidth,
    marginTop: '-2%',
  },
  text: {
    color: 'red',
    fontSize: smallFontSize,
  },
});

export default Warning;
