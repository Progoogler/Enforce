import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

export default class Result extends Component {
  constructor() {
    super();
    this.state = {
      showMaximizedImage: false,
      uri: '',
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No results for license #  <Text style={styles.license}>{ this.props.license }</Text></Text>
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
    paddingBottom: 25,
  },
  text: {
    fontSize: 22,
  },
  license: {
    color: '#4286f4',
  },
});
