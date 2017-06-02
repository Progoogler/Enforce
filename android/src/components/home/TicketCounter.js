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
    <Text style={styles.ticketCountNumber}>{ length = props.realm.objects('Ticketed')[0] ? props.realm.objects('Ticketed')[0].list.length : 0 }</Text>
    <Text style={styles.ticketCountDescription}>{length === 1 ? 'ticket' : 'tickets'} today</Text>
  </View>
);

export default TicketCounter;
