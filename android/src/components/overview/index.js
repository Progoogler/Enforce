import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Realm from 'realm';
import { NavigationActions } from'react-navigation';
import Menu from './Menu';
import MainButtons from './MainButtons';
import TicketCounter from './TicketCounter';
import TimersList from './ListView-ResetControl';


export default class Home extends Component {
  constructor() {
    super();
    this.renderedOnce = true;
    this.realm = new Realm();
  }

  static navigationOptions = {
    title: 'Overview',
    drawerLabel: 'Overview',
    drawerIcon: () => (
      <View style={styles.imageine}>
        <Image
          source={require('../../../../shared/images/eyecon.png')}
          style={[styles.icon]}
        />
      </View>
    ),
  };

  render() {
    return (
      <View style={styles.container} >
        <Menu navigation={this.props.navigation} />
        <TicketCounter ticketCount={this.realm.objects('Ticketed')[0] ? this.realm.objects('Ticketed')[0].list.length : 0} navigation={this.props.navigation} />
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
