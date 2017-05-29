import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default class MyCalloutView extends Component {
  render() {
    return (
      <View style={ this._checkTimedUp(this.props.timer) ? styles.green : styles.blue }>
        <Text>{ this.timeUp ? 'Expires at ' + this._getExpiration(this.props.timer) : 'Ready'}</Text>
      </View>
    );
  }

  _checkTimedUp(timer) {
    let timeLength = timer.timeLength * 60 * 60;
    let timeStart = timer.createdAt;
    let timeSince = (new Date() / 1000) - timeStart;
    let timeLeft = timeLength - timeSince;
    if (timeLeft < 0) {
      this.timeUp = true;
      return true;
    }
  }

  _getExpiration(timer) {
    let date = new Date((timer.createdAt * 1000) + (timer.timeLength * 60 * 60 * 1000));
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    return `${hour}:${minutes} ${period}`;
  }
}

const styles = StyleSheet.create({
  blue: {
    backgroundColor: '#4286f4',
    marginBottom: 150,
    borderRadius: 50,
    padding: 2,
  },
  green: {
    backgroundColor: 'green',
    marginBottom: 150,
    borderRadius: 50,
    padding: 2,
  }
});

MyCalloutView.propTypes = {
  title: React.PropTypes.string.isRequired
};
