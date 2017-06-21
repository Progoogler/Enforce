import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Realm from 'realm';
import Menu from './Menu';
import TicketCounter from './TicketCounter';
import TimersList from './ListView-ResetControl';


export default class Home extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.state = {
      zero: undefined,
    };
  }

  static navigationOptions = {
    title: 'Overview',
    drawerLabel: 'Overview',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/eyecon.png')}
        style={[styles.icon]} />
    ),
  };

  render() {
    return (
      <View style={styles.container} >
        <Menu navigation={this.props.navigation} />
        <TicketCounter reset={this.state.zero} ticketCount={this.realm.objects('Ticketed')[0] ? this.realm.objects('Ticketed')[0].list.length : 0} navigation={this.props.navigation} />
        <TimersList resetTicketCounter={this.resetTicketCounter.bind(this)} navigation={this.props.navigation} />
      </View>
    );
  }

  resetTicketCounter() {
    this.setState({zero: 0});
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
