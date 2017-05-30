import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default class LocationDetailsView extends Component {

  render() {
    return (
      <View style={styles.container} >
        <View style={styles.containerBorder} >
          <Text style={styles.title}>Location Details:</Text>
          <Text style={styles.details}> Pro Tip: Add location details for the first record of new timers for better recall. </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4286f4',
    alignSelf: 'stretch',
    zIndex: 10,
  },
  containerBorder: {
    backgroundColor: 'white',
    margin: 10,
    padding: 5,
  },
  title: {
    fontSize: 20,
    //textDecorationLine: 'underline',
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 15,
  },
  details: {
    color: '#4286f4',
    fontWeight: 'bold',
    fontSize: 16,
    margin: 15,
    padding: 10,
  },
});
