import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';


const MainButtons = (props) => (
  <View style={styles.mainButtonsContainer}>
    <TouchableHighlight
      onPress={() => props.navigation.navigate('Map')}
      style={styles.mapButton} >
      <Text style={styles.mapButtonText}> Map </Text>
    </TouchableHighlight>
    <View style={styles.separator} />
    <TouchableHighlight
      onPress={() => props.navigation.navigate('Camera')}
      style={styles.cameraButton} >
      <Text style={styles.cameraButtonText}> Camera </Text>
    </TouchableHighlight>
  </View>
);

const styles = StyleSheet.create({
  mainButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  },
  mapButton: {
    flex: .5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 18,
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
    height: 40,
  },
  cameraButton: {
    flex: .5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
  }
});

export default MainButtons;
