import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Header from '../home/Header';


export default class VINSearch extends Component {
  static navigationOptions = {
    drawerLabel: 'VIN Search',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/search-icon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />
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
