import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import { mediumFontSize, primaryBlue } from '../../styles/common';

export default class Result extends Component {
  constructor() {
    super();
    this.state = {
      showMaximizedImage: false,
      uri: '',
    }
  }

  render() {

    var vinCheck;
    if (this.props.license.length === 4) {
      vinCheck = parseInt(this.props.license) + '';
      vinCheck = vinCheck.length === 4 ? true : false;
    }

    return (
      <View style={styles.container}>
        {
          vinCheck ? 
          <Text style={styles.text}>No results for VIN #  <Text style={styles.license}>{ this.props.license }</Text></Text> 
          :
          <Text style={styles.text}>No results for license #  <Text style={styles.license}>{ this.props.license }</Text></Text>
        }
      </View>
    );
  }
}

Result.propTypes = { license: PropTypes.string.isRequired };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingBottom: '8%',
  },
  text: {
    fontSize: mediumFontSize,
  },
  license: {
    color: primaryBlue,
  },
});
