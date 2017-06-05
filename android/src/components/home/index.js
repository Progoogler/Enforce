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
    this.state = {
      ticketCount: 0,
    }
    this.renderedOnce = true;
    this.realm = new Realm();
  }

  static navigationOptions = {
    drawerLabel: 'Overview',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/eyecon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container} >
        <Header navigation={this.props.navigation} />
        <MainButtons navigation={this.props.navigation} />
        <TicketCounter realm={this.realm} ticketCount={this.state.ticketCount} />
        <TimersList
          navigation={this.props.navigation}
          updateTicketCount={this.updateTicketCount.bind(this)}
          toggleRendered={this.toggleRendered}
          renderedOnce={this.renderedOnce} />
      </View>
    );
  }

  componentWillMount() {
    let ticketCount = this.realm.objects('Ticketed')[0] ? this.realm.objects('Ticketed')[0].list.length : 0;
    this.setState({ticketCount});
  }

  updateTicketCount() {
    this.setState({ticketCount: 0});
  }

  toggleRendered() {
    this.renderedOnce = false;
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
