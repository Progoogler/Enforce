import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import PropTypes from 'prop-types';

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
    return (
      <View>
      {
        this.props.newTimer ?
        <View style={styles.notification}>
          <Notification />
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={.8}
            onPress={this._updateTimeLimit.bind(this)} >
            <Text style={styles.buttonText}>Set Limit</Text>
          </TouchableOpacity>
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

        <TouchableOpacity
          style={styles.setButton}
          activeOpacity={.8}
          onPress={this._updateTimeLimit.bind(this)} >
          <Text style={styles.buttonText}>Set Limit</Text>
        </TouchableOpacity>
      </View>
    }
    </View>
    );
  }

  componentDidMount() {
    if (this.props.realm.objects('TimeLimit')) {
      let history = this.props.realm.objects('TimeLimit')[0];
      this.setState({
        hour: history.hour,
        minutes: history.minutes ? history.minutes.length === 1 ? '0' + history.minutes : history.minutes : '00',
      });
    }
  }

  _onChangeHour(hour: string) {
    let nan = /[^0-9]/.test(hour);
    if ((isNaN(parseInt(hour)) && hour !== '') || nan) {
      this.setState({hour: '1'});
      return;
    }
    this.setState({hour});
  }

  _onChangeMinutes(minutes: string) {
    let nan = /[^0-9]/.test(minutes);
    let int = parseInt(minutes)
    if ((isNaN(int) && minutes !== '') || int > 60 || nan) {
      this.setState({minutes: '00'});
      return;
    }
    this.setState({minutes});
  }

  _updateTimeLimit() {
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

SetTimeLimit.propTypes = {
  newTimer: PropTypes.bool.isRequired,
  realm: PropTypes.object.isRequired,
  onUpdateTimeLimit: PropTypes.func.isRequired,
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
    marginLeft: 67,
    backgroundColor: 'green',
    borderWidth: 2,
    borderRadius: 8,
    borderColor: 'white',
  }
});
