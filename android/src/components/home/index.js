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
    // this.state = {
    //   timerList: undefined
    // };
    // this.realm = new Realm();
  }

  // componentDidMount() {
  //   this.renderTimerLists();
  // }

  render() {
    return (
      <View style={styles.container} >
        <Header navigation={this.props.navigation} />
        <MainButtons navigation={this.props.navigation} />
        <TicketCounter />
        <TimersList navigation={this.props.navigation} />
      </View>
    )
  }

  // renderTimerLists() {
  //   const lists = [];
  //   let skip = true;
  //   this.realm.objects('Timers').forEach(timerList => {
  //     if (timerList.list.length >= 1) {
  //       if (skip) {
  //         lists.push(
  //           <TouchableHighlight
  //             onPress={() => this._openTimerListPage(timerList)} >
  //             <View style={{
  //               flexDirection: 'row',
  //               alignItems: 'center',
  //               height: 75,
  //               borderTopWidth: 2,
  //               borderColor: 'black',}}>
  //               <Text style={styles.timerRowLength}>
  //                 { (timerList.list.length > 1) ? timerList.list.length + '\n cars' : '1 \n car' }
  //               </Text>
  //               <Text style={styles.timerRowTime}>
  //                 { this.getTimeLeft(timerList.list[0]) }
  //               </Text>
  //             </View>
  //           </TouchableHighlight>
  //         );
  //         skip = false;
  //       } else {
  //         skip = true;
  //         lists.push(
  //           <TouchableHighlight
  //             onPress={() => this._openTimerListPage(timerList)} >
  //             <View style={styles.timerRow}>
  //               <Text style={styles.timerRowLength}>
  //                 { (timerList.list.length > 1) ? timerList.list.length + '\n cars' : '1 \n car' }
  //               </Text>
  //               <Text style={styles.timerRowTime}>
  //                 { this.getTimeLeft(timerList.list[0]) }
  //               </Text>
  //             </View>
  //           </TouchableHighlight>
  //         );
  //       }
  //     }
  //   });
  //   this.setState({timerList: lists});
  // }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },


});
