import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default class MyCalloutView extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={ this.props.secondary ? null : (this._checkTimedUp(this.props.timer) ? styles.green : styles.blue) }>
          <Text style={styles.message}>{ this.props.secondary ? null : (this._checkTimedUp(this.props.timer) ? 'Ready' : 'Expires at ' + this._getExpiration(this.props.timer) + '\n' + this._prettyMessage(this.props.timer.description)) }</Text>
        </View>
        <View style={ this.props.secondary ? (this._checkTimedUp(this.props.timer) ? styles.greenCircle : styles.blueCircle) : (this._checkTimedUp(this.props.timer) ? styles.greenTriangle : styles.blueTriangle) } />
      </View>
    );
  }

  _checkTimedUp(timer) {
    let timeLength = timer.timeLength * 60 * 60;
    let timeSince = new Date() - timer.createdAt;
    let timeLeft = timeLength - (timeSince / 1000);
    if (timeLeft < 0) {
      this.timeUp = true;
      return true;
    }
  }

  _getExpiration(timer) {
    let date = new Date(timer.createdAt + (timer.timeLength * 60 * 60 * 1000));
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    return `${hour}:${minutes} ${period}`;
  }

  _prettyMessage(string) {
    if (string.length > 45) {
      let arr = string.split('');
      for (let i = 40; i < arr.length; i++) {
        if (arr[i] === ' ') {
          arr.splice(i, 0, '\n');
          return arr.join('');
        }
      }
    }
    return string;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  blue: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4286f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 6,
  },
  green: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 6,
  },
  message: {
    textAlign: 'center',
    color: 'white',
    paddingBottom: 8,
  },
  blueTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4286f4',
    transform: [
      {rotate: '180deg'}
    ]
  },
  greenTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'green',
    transform: [
      {rotate: '180deg'}
    ]
  },
  blueCircle: {
    height: 25,
    width: 25,
    borderRadius: 12,
    backgroundColor: '#4286f4',
  },
  greenCircle: {
    height: 25,
    width: 25,
    borderRadius: 12,
    backgroundColor: 'green',
  }
});

MyCalloutView.propTypes = {
  title: React.PropTypes.string.isRequired
};
