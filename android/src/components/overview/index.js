import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import Realm from 'realm';
import PushNotification from 'react-native-push-notification';
import Menu from './Menu';
import TicketCounter from './TicketCounter';
import TimersList from './ListView-ResetControl';


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
        <Menu navigation={this.props.navigation} />
        <TicketCounter
          reset={this.state.zero}
          navigation={this.props.navigation}
          ticketCount={this.realm.objects('Ticketed')[0] ? this.realm.objects('Ticketed')[0].list.length : 0} />
        <TimersList resetTicketCounter={this.resetTicketCounter.bind(this)} navigation={this.props.navigation} />
      </View>
    );
  }

  resetTicketCounter() {
    this.setState({zero: true});
  }

  componentDidMount() {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
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

Overview.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
});
