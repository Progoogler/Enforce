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


const TicketCounter = (props) => (
  <View style={styles.ticketCountContainer} >
    <Text style={styles.ticketCountNumber}>{ props.realm.objects('Ticketed')[0].list.length }</Text>
    <Text style={styles.ticketCountDescription}>tickets today</Text>
  </View>
);

export default TicketCounter;
