import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
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
          <Text style={styles.text}>No result for VIN #  <Text style={styles.license}>{ this.props.license }</Text></Text> 
          :
          this.props.type === 'searched' ?
          <Text style={styles.text}>No result for license #  <Text style={styles.license}>{ this.props.license }</Text></Text>
          :
          <View>
            <Text style={styles.text}>No result for license #  <Text style={styles.license}>{ this.props.license }</Text></Text>
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => this.props.deepSearch()}
              style={styles.searchTouch}
            >
              <Text style={styles.searchText}>Deep Search</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }
}

Result.propTypes = { 
  deepSearch: PropTypes.func.isRequired,
  license: PropTypes.string.isRequired,
};

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
  searchText: {
    color: primaryBlue,
    textAlign: 'center',
  },
  searchTouch: {
    // alignSelf: 'flex-end',
  },
});
 