import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { smallFontSize } from '../../styles/common';

const Warning = (props) => (
  <View style={styles.container}>
    <View style={styles.filler} />
    <View style={styles.textWrap}>
      <Text style={styles.text}>{props.warning}</Text>
    </View>
  </View>
);

Warning.propTypes = { warning: PropTypes.string.isRequired }

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: '-2%',
  },
  filler: {
    flex: .40,
  },
  textWrap: {
    flex: .60,
  },
  text: {
    color: 'red',
    fontSize: smallFontSize,
  },
});

export default Warning;
