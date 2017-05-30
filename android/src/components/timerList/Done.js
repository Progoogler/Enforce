import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';

const Done = (props) => (
  <View style={styles.view}>
  <TouchableHighlight
    style={styles.container}
    onPress={() => {props.navigation.navigate('Home')}}
    underlayColor="#0055e1" >
    <Text style={styles.text}>Done</Text>
  </TouchableHighlight>
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#4286f4',
    height: 80,
    width: 100,
    borderRadius: 10,
    marginBottom: 18,
  },
  text: {
    padding: 5,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Done;
