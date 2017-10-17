import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import { mediumFontSize, primaryBlue } from '../../styles/common';

export default class Unfound extends Component {
  constructor() {
    super();
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
            >
              <Text style={styles.searchText}>Deep Search</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.type !== nextProps.type) return true;
    if (this.props.license !== nextProps.license) return true;
    if (nextProps.searching === false) return false;
    if (this.props.searching !== nextProps.searching) return true;
    return false;
  }
}

Unfound.propTypes = { 
  deepSearch: PropTypes.func.isRequired,
  license: PropTypes.string.isRequired,
  searching: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
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
});
 