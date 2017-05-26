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

export default class TicketCounter extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.ticketCountContainer} >
        <Text style={styles.ticketCountNumber}>{ this.props.realm.objects('Ticketed')[0].list.length }</Text>
        <Text style={styles.ticketCountDescription}>tickets today</Text>
      </View>
    );
  }
}
