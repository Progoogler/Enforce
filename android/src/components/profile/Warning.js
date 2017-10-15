import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { smallFontSize, textInputWidth } from '../../styles/common';


export default class Warning extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{this.props.warning}</Text>
      </View>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.warning !== nextProps.warning) return true;
    return false;
  }
}
 
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