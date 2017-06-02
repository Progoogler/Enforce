import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Realm from 'realm';
import { NavigationActions } from'react-navigation';
import Header from './Header';
import MainButtons from './MainButtons';
import TicketCounter from './TicketCounter';
import TimersList from './ListView';


export default class Home extends Component {
  constructor() {
    super();
    this.realm = new Realm();
  }

  static navigationOptions = {
    drawerLabel: 'Overview',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/home-icon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container} >
        <Header navigation={this.props.navigation} />
        <MainButtons navigation={this.props.navigation} />
        <TicketCounter realm={this.realm} />
        <TimersList navigation={this.props.navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
