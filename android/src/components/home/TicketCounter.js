import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import Realm from 'realm';

const styles = StyleSheet.create({
  ticketCountContainer: {
    flex: .25,
    alignItems: 'center',
    padding: 15,
  },
  ticketCountNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'green',
  },
  ticketCountDescription: {
    color: 'green',
    fontSize: 18,
  },
});

this.ticketCount = 10;

const TicketCounter = (props) => (
  <View style={styles.ticketCountContainer} >
    <Text style={styles.ticketCountNumber}>{ this.ticketCount }</Text>
    <Text style={styles.ticketCountDescription}>tickets today</Text>
  </View>
);

export default TicketCounter;
