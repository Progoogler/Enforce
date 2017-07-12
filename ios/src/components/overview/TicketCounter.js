import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import { ticketCountFontSize, ticketDescFontSize } from '../../styles/common';

const TicketCounter = (props) => (
  <TouchableWithoutFeedback
    onLongPress={ () => props.navigation.navigate('History') }>
    <View style={styles.ticketCountContainer}>
      <Text style={styles.ticketCountNumber}>{ props.reset ? 0 : props.ticketCount }</Text>
      <Text style={styles.ticketCountDescription}>{ props.ticketCount === 1 ? 'ticket' : 'tickets'} today</Text>
    </View>
  </TouchableWithoutFeedback>
);

TicketCounter.propTypes = {
  navigation: PropTypes.object.isRequired,
  reset: PropTypes.bool.isRequired,
  ticketCount: PropTypes.number,
}

const styles = StyleSheet.create({
  ticketCountContainer: {
    alignItems: 'center',
    marginTop: '6%',
    marginBottom: '10%',
  },
  ticketCountNumber: {
    fontSize: ticketCountFontSize,
    fontWeight: 'bold',
    color: 'green',
  },
  ticketCountDescription: {
    color: 'green',
    fontSize: ticketDescFontSize,
  },
});

export default TicketCounter;
