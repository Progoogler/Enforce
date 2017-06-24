import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Navigation from '../navigation';

export default class ComingSoon extends Component {
  render() {
    return (
      <View style={styles.container}>
          <Navigation navigation={this.props.navigation} />
        <Text style={styles.title}>This page is currently in progress.</Text>
        <Text style={styles.message}>We'll let you know when it's ready!</Text>
        <Image style={styles.image} source={require('../../../../shared/images/worker.jpg')} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    marginTop: 200,
  },
  title: {
    fontSize: 24,
    marginTop: 180,
  },
  message: {
    fontSize: 24,

  },
});
