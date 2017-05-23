import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Image,
  TouchableHighlight,
  BackAndroid,
} from 'react-native';
import Realm from 'realm';

import Header from './Header';
import MainButtons from './MainButtons';
import TicketCounter from './TicketCounter';

import { NavigationActions } from'react-navigation';

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      timerList: undefined
    };
    this.realm = new Realm();
  }

  componentDidMount() {
    this.renderTimerLists();
  }

  render() {
    return (
      <View style={styles.container} >
        <Header navigation={this.props.navigation} />
        <MainButtons navigation={this.props.navigation} />
        <TicketCounter />

        <ScrollView style={styles.timerRowsContainer} >
          {this.state.timerList}
        </ScrollView>

      </View>
    )
  }

  renderTimerLists() {
    const lists = [];
    let skip = true;
    this.realm.objects('Timers').forEach(timerList => {
      if (timerList.list.length >= 1) {
        if (skip) {
          lists.push(
            <TouchableHighlight
              onPress={() => this._openTimerListPage(timerList)} >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 75,
                borderTopWidth: 2,
                borderColor: 'black',}}>
                <Text style={styles.timerRowLength}>
                  { (timerList.list.length > 1) ? timerList.list.length + '\n cars' : '1 \n car' }
                </Text>
                <Text style={styles.timerRowTime}>
                  { this.getTimeLeft(timerList.list[0]) }
                </Text>
              </View>
            </TouchableHighlight>
          );
          skip = false;
        } else {
          skip = true;
          lists.push(
            <TouchableHighlight
              onPress={() => this._openTimerListPage(timerList)} >
              <View style={styles.timerRow}>
                <Text style={styles.timerRowLength}>
                  { (timerList.list.length > 1) ? timerList.list.length + '\n cars' : '1 \n car' }
                </Text>
                <Text style={styles.timerRowTime}>
                  { this.getTimeLeft(timerList.list[0]) }
                </Text>
              </View>
            </TouchableHighlight>
          );
        }
      }
    });
    this.setState({timerList: lists});
  }

  _openTimerListPage(timerList) {
    //console.log('list', timerList);
    const navigateAction = NavigationActions.navigate({
      routeName: 'TimerList',
      params: {timers: timerList},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  getTimeLeft(timer) {
    let timeLength = timer.timeLength * 60 * 60;
    let timeStart = timer.createdAt;
    let timeSince = (new Date() / 1000) - timeStart;
    let timeLeft = timeLength - timeSince;
    let value = '';
    if (timeLeft < 0) {
      return value = 'Time is up!';
    } else if (timeLeft < 60) {
      return value = 'less than a minute remaining';
    } else if (timeLeft < 3600) {
      return value = Math.floor(timeLeft / 60) + ' minutes remaining';
    } else if (timeLeft > 3600 && timeLeft < 7200) {
      return value = '1 hour ' + Math.floor((timeLeft - 3600) / 60) + ' minutes remaining';
    } else if (timeLeft > 7200 && timeLeft < 10800) {
      return value = '2 hours ' + Math.floor((timeLeft - 7200) / 60) + ' minutes remaining';
    } else if (timeLeft > 10800 && timeLeft < 14400) {
      return value = '3 hours ' + Math.floor((timeLeft - 14400) / 60) + ' minutes remaining';
    } else {
      return value = 'Time is unknown.';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerRowsContainer: {
    alignSelf: 'stretch',
    marginTop: 25,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 75,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'black',
  },
  timerRowLength: {
    fontSize: 20,
    paddingLeft: 30,
    textAlign: 'center',
  },
  timerRowTime: {
    paddingLeft: 50,
  },
});
