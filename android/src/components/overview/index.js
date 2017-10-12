import React, { Component } from 'react';
import {
  AsyncStorage,
  DeviceEventEmitter,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import PropTypes from 'prop-types';
import PushNotification from 'react-native-push-notification';
import Realm from 'realm';

import Menu from './Menu';
import TicketCounter from './TicketCounter';
import TimersList from './TimersList';


/* global require */
export default class Overview extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.state = {
      zero: false,
    };
  }

  static navigationOptions = {
    title: 'Overview',
    drawerLabel: 'Overview',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/eyecon.png')} />
    ),
  };

  render() {
    return (
      <View style={styles.container} >
        <Menu 
          navigation={this.props.navigation} 
          refPath={this.props.screenProps.refPath}
        />
        <TicketCounter
          reset={this.state.zero}
          navigation={this.props.navigation}
          ticketCount={this.realm.objects('Ticketed')[0] ? this.realm.objects('Ticketed')[0].list.length : 0} />
        <TimersList 
          currentDay={this.props.screenProps.currentDay}
          navigation={this.props.navigation}
          resetTicketCounter={this.resetTicketCounter.bind(this)} 
        />
      </View>
    );
  }

  componentDidMount() {
    this._checkToSetPushNotifications();
  }

  async _checkToSetPushNotifications() {
    var prevLen = await AsyncStorage.getItem('@Enforce:timerListsLength');
    var len = this.realm.objects('Timers').length;
    if (len > parseInt(prevLen)) {
      this._setPushNotifications();
      AsyncStorage.setItem('@Enforce:timerListsLength', `{len}`);
    } else if (parseInt(prevLen) > len || prevLen === null) {
      AsyncStorage.setItem('@Enforce:timerListsLength', `{len}`);
      if (len > 1) this._setPushNotifications();
    }
  }

  _setPushNotifications() {
    PushNotification.configure({
      onNotification: function() {
        // @Param notification is an argument passed to this callback
      },

      requestPermissions: true,
    });

    PushNotification.cancelAllLocalNotifications()

    var timers = this.realm.objects('Timers');
    timers.forEach((timersLists, idx) => {
      if (!timersLists.list[0]) return;

      let timeLeft = (timersLists.list[0].timeLength * 60 * 60 * 1000) - ((new Date() / 1) - timersLists.list[0].createdAt);
      if (timeLeft < 0) return;

      let message = this._getTimeLimit(timersLists.list[0].timeLength) + " Limit Timer has expired";
      let subText = timersLists.list[0].description ? timersLists.list[0].description : '';
      let actions = timersLists.list[0].latitude ? '["Show map"]' : '';

      PushNotification.localNotificationSchedule({
        message,
        subText,
        actions,
        tag: idx,
        vibration: 300,
        date: new Date(Date.now() + (timeLeft)),
      });
    });

    PushNotification.registerNotificationActions(['Show map']);
    DeviceEventEmitter.addListener('notificationActionReceived', (action) => {
      const info = JSON.parse(action.dataJSON);
      if (info.action == 'Show map') {
        this._openMapPage(info.tag);
      }
    });
  }

  resetTicketCounter() {
    this.setState({zero: true});
  }

  _openMapPage(index: number): undefined {
    const navigateAction = NavigationActions.navigate({
      routeName: 'Map',
      params: {timers: this.realm.objects('Timers')[index].list, navigation: this.props.navigation},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  _getTimeLimit(length) {
    if (length < 1) {
      length = length * 60;
      return `${parseInt(length)}  Minute`;
    } else {
      return `${parseFloat(length.toFixed(1))}  Hour`;
    }
  }

}

Overview.propTypes = { 
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired, 
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
