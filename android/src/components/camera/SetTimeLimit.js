import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  Keyboard,
  Vibration,
} from 'react-native';

import Notification from './Notification';

export default class SetTimeLimit extends Component {
  constructor() {
    super();
    this.state = {
      hour: "1",
      minutes: "00",
    }
  }

  render() {
    console.log('SET TIME', this.props.realm.objects('TimeLimit'))
    console.log('TIME LIMIT', this.state.hour, this.state.minutes)
    return (
      <View>
      {
        this.props.newTimer ?
        <View style={styles.notification}>
          <Notification />
          <TouchableHighlight
            style={styles.notificationButton}
            underlayColor="green"
            onPress={this._updateTimeLimit.bind(this)} >
            <Text style={styles.buttonText}>Set Limit</Text>
          </TouchableHighlight>
        </View>

        :

      <View style={styles.container}>
          <TextInput
            style={styles.hourInput}
            keyboardType={'numeric'}
            maxLength={1}
            onChangeText={(hour) => this._onChangeHour(hour)}
            value={this.state.hour} />
          <Text style={styles.timeDesc}>Hr</Text>
          <TextInput
            style={styles.minutesInput}
            keyboardType={'numeric'}
            maxLength={2}
            onChangeText={(minutes) => this._onChangeMinutes(minutes)}
            value={this.state.minutes} />
          <Text style={styles.timeDesc}>Min</Text>

        <TouchableHighlight
          style={styles.setButton}
          underlayColor="green"
          onPress={this._updateTimeLimit.bind(this)} >
          <Text style={styles.buttonText}>Set Limit</Text>
        </TouchableHighlight>
      </View>
    }
    </View>
    );
  }

  componentDidMount() {
    if (this.props.realm.objects('TimeLimit')) {
      let history = this.props.realm.objects('TimeLimit')[0];
      console.log('history', history)
      this.setState({
        hour: history.hour,
        minutes: history.minutes
      });
    }
  }

  _onChangeHour(hour) {
    let nan = /[^0-9]/.test(hour);
    if ((isNaN(parseInt(hour)) && hour !== '') || nan) {
      this.setState({hour: '1'});
      return;
    }
    this.setState({hour});
  }

  _onChangeMinutes(minutes) { console.log('minutes', minutes)
    let nan = /[^0-9]/.test(minutes);
    let int = parseInt(minutes)
    if ((isNaN(int) && minutes !== '') || int > 60 || nan) {
      this.setState({minutes: '00'});
      return;
    }
    this.setState({minutes});
  }

  _updateTimeLimit() {
    //Vibration.vibrate([0, 500], true);
    let timeLimit = this.props.realm.objects('TimeLimit')[0];
    let decimalMinutes = `${parseInt(this.state.minutes) / 60}`;
    let newLimit;
    let minutes;
    Keyboard.dismiss();
    if (decimalMinutes.length === 1) {
      if (decimalMinutes === "1") {
        minutes = "00";
        this.setState({hour: this.state.hour + 1});
        newLimit = parseFloat(`${parseInt(this.state.hour)}.0`);
        this.props.realm.write(() => {
          timeLimit.hour = this.state.hour === undefined ? "0" : this.state.hour;
          timeLimit.minutes = minutes;
          timeLimit.float = newLimit;
        })
        this.props.onUpdateTimeLimit(newLimit);
        return;
      } else if (decimalMinutes === "0") {
        newLimit = parseFloat(`${parseInt(this.state.hour)}.0`);
        this.props.realm.write(() => {
          timeLimit.hour = this.state.hour === undefined ? "0" : this.state.hour;
          timeLimit.minutes = "00";
          timeLimit.float = newLimit;
        });
        this.props.onUpdateTimeLimit(newLimit);
        this.setState({minutes: "00"});
        return;
      }
    }
    decimalMinutes = decimalMinutes.slice(1);
    newLimit = this.state.hour + decimalMinutes;
    newLimit = parseFloat(newLimit);
    this.props.realm.write(() => {
      timeLimit.hour = this.state.hour === undefined ? "0" : this.state.hour;
      timeLimit.minutes = this.state.minutes === undefined ? "00" : this.state.minutes;
      timeLimit.float = newLimit;
    });
    this.props.onUpdateTimeLimit(newLimit);
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'grey',
  },
  hourInput: {
    width: 25,
    fontSize: 24,
    color: 'white',
  },
  minutesInput: {
    width: 40,
    fontSize: 24,
    color: 'white',
  },
  timeDesc: {
    fontSize: 18,
    marginRight: 25,
  },
  setButton: {
    marginLeft: 40,
    backgroundColor: 'green',
    borderWidth: 2,
    borderRadius: 8,
    borderColor: 'white',
  },
  buttonText: {
    fontSize: 28,
    color: 'white',
    padding: 4,
  },
  notification: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: 'green',
    height: 74,
    backgroundColor: 'grey',
  },
  notificationButton: {
    marginLeft: 70,
    backgroundColor: 'green',
    borderWidth: 2,
    borderRadius: 8,
    borderColor: 'white',
  }
});
