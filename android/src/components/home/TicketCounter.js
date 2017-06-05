import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  ticketCountContainer: {
    alignItems: 'center',
    padding: 15,
    marginTop: 15,
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

let length = 0;

const TicketCounter = (props) => (
  <View style={styles.ticketCountContainer} >
    <Text style={styles.ticketCountNumber}>{ props.ticketCount }</Text>
    <Text style={styles.ticketCountDescription}>{ props.ticketCount === 1 ? 'ticket' : 'tickets'} today</Text>
  </View>
);

export default TicketCounter;
