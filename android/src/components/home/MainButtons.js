import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import Realm from 'realm';


const styles = StyleSheet.create({
  mainButtonsContainer: {
    flexDirection: 'row',
  },
  mapButton: {
    flex: .5,
    height: 70,
    borderWidth: 2,
    borderColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonText: {

  },
  cameraButton: {
    flex: .5,
    height: 70,
    borderWidth: 2,
    borderColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {

  }
});

const MainButtons = (props) => (
  <View style={styles.mainButtonsContainer}>
    <TouchableHighlight
      onPress={() => props.navigation.navigate('Map')}
      style={styles.mapButton} >
      <Text style={styles.mapButtonText}> Map </Text>
    </TouchableHighlight>
    <TouchableHighlight
      onPress={() => props.navigation.navigate('Camera')}
      style={styles.cameraButton} >
      <Text style={styles.cameraButtonText}> Camera </Text>
    </TouchableHighlight>
  </View>
);

export default MainButtons;
