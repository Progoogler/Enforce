import React, { Component } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Realm from 'realm';

import Notification from './Notification';
import {
  extraLargeFontSize,
  largeFontSize,
  mediumFontSize,
  timeLimitContainerHeight,
} from '../../styles/common';

export default class SetTimeLimit extends Component {
  constructor() {
    super();
    this.realm = new Realm();
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
            activeOpacity={.8}
            onPress={this._updateTimeLimit.bind(this)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Set Limit</Text>
          </TouchableOpacity>
        </View>

        :

        <View style={styles.container}>
          <View style={styles.timeInputsContainer}>
            <TextInput
              keyboardType={'numeric'}
              maxLength={1}
              onChangeText={(hour) => this._onChangeHour(hour)}
              style={styles.hourInput}
              value={this.state.hour} 
            />
            <Text style={styles.timeDesc}>Hr</Text>
            <TextInput
              keyboardType={'numeric'}
              maxLength={2}
              onChangeText={(minutes) => this._onChangeMinutes(minutes)}
              style={styles.minutesInput}
              value={this.state.minutes} 
            />
            <Text style={styles.timeDesc}>Min</Text>
          </View>

          <TouchableOpacity
            activeOpacity={.8}
            onPress={this._updateTimeLimit.bind(this)} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>Set Limit</Text>
          </TouchableOpacity>
        </View>
      }
    </View>
    );
  }

  componentDidMount() {
    if (this.realm.objects('TimeLimit')) {
      let history = this.realm.objects('TimeLimit')[0];
      this.setState({
        hour: history.hour,
        minutes: history.minutes ? history.minutes.length === 1 ? '0' + history.minutes : history.minutes : '00',
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.newTimer !== nextProps.newTimer) return true;
    if (this.state.hour !== nextState.hour) return true;
    if (this.state.minutes !== nextState.minutes) return true;
    return false;
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
    let timeLimit = this.realm.objects('TimeLimit')[0];
    let decimalMinutes = `${parseInt(this.state.minutes) / 60}`;
    let newLimit;
    let minutes;
    Keyboard.dismiss();
    if (decimalMinutes.length === 1) {
      if (decimalMinutes === "1") {
        minutes = "00";
        this.setState({hour: this.state.hour + 1});
        newLimit = parseFloat(`${parseInt(this.state.hour)}.0`);
        this.realm.write(() => {
          timeLimit.hour = this.state.hour === undefined ? "0" : this.state.hour;
          timeLimit.minutes = minutes;
          timeLimit.float = newLimit;
        })
        this.props.onUpdateTimeLimit(newLimit);
        return;
      } else if (decimalMinutes === "0") {
        newLimit = parseFloat(`${parseInt(this.state.hour)}.0`);
        this.realm.write(() => {
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
    this.realm.write(() => {
      timeLimit.hour = this.state.hour === undefined ? "0" : this.state.hour;
      timeLimit.minutes = this.state.minutes === undefined ? "00" : this.state.minutes;
      timeLimit.float = newLimit;
    });
    this.props.onUpdateTimeLimit(newLimit);
  }
}

SetTimeLimit.propTypes = {
  newTimer: PropTypes.bool.isRequired,
  onUpdateTimeLimit: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'green',
    borderColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: extraLargeFontSize,
    padding: '1.5%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'grey',
    flexDirection: 'row',
    height: timeLimitContainerHeight,
    justifyContent: 'space-between',
    paddingLeft: '6%',
    paddingRight: '6%',
  },
  hourInput: {
    color: 'white',
    fontSize: largeFontSize,
    width: '12%',
  },
  minutesInput: {
    color: 'white',
    fontSize: largeFontSize,
    width: '18%',
  },
  notification: {
    alignItems: 'center',
    backgroundColor: 'grey',
    borderBottomWidth: 4,
    borderColor: 'green',
    flexDirection: 'row',
    height: timeLimitContainerHeight + 4,
    justifyContent: 'space-between',
    paddingLeft: '6%',
    paddingRight: '6%',
  },
  timeDesc: {
    fontSize: mediumFontSize,
    marginRight: '8%',
  },
  timeInputsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
 