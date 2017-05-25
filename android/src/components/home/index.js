import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Realm from 'realm';

import Header from './Header';
import MainButtons from './MainButtons';
import TicketCounter from './TicketCounter';
import TimersList from './ListView';

import { NavigationActions } from'react-navigation';

export default class Home extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container} >
        <Header navigation={this.props.navigation} />
        <MainButtons navigation={this.props.navigation} />
        <TicketCounter />
        <TimersList navigation={this.props.navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});
