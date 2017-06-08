import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});



class Title extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{this._getTimeLimitResponse(this.props.limit)} Queue </Text>
      </View>
    );
  }

  _getTimeLimitResponse(length) {
    if (length === 0 || typeof length === 'string') return '';
    if (length < 1) {
      length = length * 60;
      return `${parseInt(length)}  Minute`;
    } else {
      return `${parseFloat(length.toFixed(1))}  Hour`;
    }
  }

}

export default Title;
