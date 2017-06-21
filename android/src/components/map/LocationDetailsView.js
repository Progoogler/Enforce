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
          <View style={styles.row}>
          <Text style={styles.bold}>Reminder:</Text>
          <Text style={styles.details}>Save location details for the first {'\n'} record of new timers for better recall. </Text>
          </View>
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
  row: {
    flexDirection: 'row',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 20,
    margin: 5,
    color: '#4286f4',
  },
  details: {
    color: '#4286f4',
    fontWeight: 'bold',
    fontSize: 16,
    margin: 5,
  },
});
