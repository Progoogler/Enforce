import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';


const MainButtons = (props) => (
  <View style={styles.mainButtonsContainer}>
    <TouchableHighlight
      onPress={() => props.navigation.navigate('Map')}
      underlayColor="#4286f4"
      style={styles.mapButton} >
      <Image source={require('../../../../shared/images/white-pin.png')} />
    </TouchableHighlight>
    <View style={styles.separator} />
    <TouchableHighlight
      underlayColor="#4286f4"
      onPress={() => props.navigation.navigate('Camera')}
      style={styles.cameraButton} >
      <Image source={require('../../../../shared/images/camera.png')} />
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
