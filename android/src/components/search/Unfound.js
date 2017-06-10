import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

export default class Result extends Component {
  constructor() {
    super();
    this.state = {
      showMaximizedImage: false,
      uri: '',
    }
  }

  render() { console.log('renders', this.props.license)
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No results for license #  <Text style={styles.license}>{ this.props.license }</Text></Text>
      </View>
    );
  }
}

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
