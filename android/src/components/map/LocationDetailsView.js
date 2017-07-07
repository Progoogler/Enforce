import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  primaryBlue,
  mediumFontSize,
  smallFontSize,
} from '../../styles/common';


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
    backgroundColor: primaryBlue,
    alignSelf: 'stretch',
    zIndex: 10,
  },
  containerBorder: {
    backgroundColor: 'white',
    margin: '3%',
    padding: '1.5%',
  },
  row: {
    flexDirection: 'row',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: mediumFontSize,
    margin: '1.5%',
    color: primaryBlue,
  },
  details: {
    color: primaryBlue,
    fontWeight: 'bold',
    fontSize: smallFontSize,
    margin: '1.5%',
  },
});
