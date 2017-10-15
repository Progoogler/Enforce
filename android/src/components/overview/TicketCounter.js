import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { ticketCountFontSize, ticketDescFontSize } from '../../styles/common';

export default class TicketCounter extends Component {
  constructor() {
    super();
  }

  render() { console.log('ticket counter')
    return (
      <TouchableWithoutFeedback
        onLongPress={ () => this.props.navigation.navigate('History') }>
        <View style={styles.ticketCountContainer}>
          <Text style={styles.ticketCountNumber}>{ this.props.reset ? 0 : this.props.ticketCount }</Text>
          <Text style={styles.ticketCountDescription}>{ this.props.ticketCount === 1 ? 'ticket' : 'tickets'} today</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.reset !== nextProps.reset) return true;
    if (this.props.ticketCount !== nextProps.ticketCount) return true;
    return false;
  }
}

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
    color: 'green',
    fontSize: ticketCountFontSize,
    fontWeight: 'bold',
  },
  ticketCountDescription: {
    color: 'green',
    fontSize: ticketDescFontSize,
  },
});