import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue, smallFontSize } from '../../styles/common';

export default class CustomCallout extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={ this.props.title ? (this._checkTimedUp(this.props.timer) ? styles.green : styles.blue) : null }>
          <Text style={styles.message}>
            { this.props.title ? (this._checkTimedUp(this.props.timer) ? 'Ready' : 'Expires at ' + this._getExpiration(this.props.timer)) : null }
          </Text>
        </View>
        <View style={ this._checkTimedUp(this.props.timer) ? styles.greenTriangle : styles.blueTriangle } />
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
}

CustomCallout.propTypes = {
  timer: PropTypes.object.isRequired,
  title: PropTypes.string,
  secondary: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  blue: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: '2%',
    marginBottom: -2,
  },
  green: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: '2%',
    marginBottom: -2,
  },
  message: {
    textAlign: 'center',
    fontSize: smallFontSize,
    color: 'white',
    margin: '1%',
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
    borderBottomColor: primaryBlue,
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
});
 