import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue, smallFontSize } from '../../styles/common';

export default class CustomCallout extends Component {
  render() { console.log('custom callout renders')
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

  shouldComponentUpdate(nextProps) {
    if (this.props.title !== nextProps.title) return true;
    return false;
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
    alignItems: 'center',
    backgroundColor: primaryBlue,
    borderRadius: 50,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: -2,
    padding: '2%',
  },
  green: {
    alignItems: 'center',
    backgroundColor: 'green',
    borderRadius: 50,
    flex: 1,
    justifyContent: 'center',
    marginBottom: -2,
    padding: '2%',
  },
  message: {
    color: 'white',
    fontSize: smallFontSize,
    margin: '1%',
    textAlign: 'center',
  },
  blueTriangle: {
    backgroundColor: 'transparent',
    borderBottomColor: primaryBlue,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderLeftWidth: 10,
    borderRightColor: 'transparent',
    borderRightWidth: 10,
    borderStyle: 'solid',
    height: 0,
    transform: [
      {rotate: '180deg'}
    ],
    width: 0,
  },
  greenTriangle: {
    backgroundColor: 'transparent',
    borderBottomColor: 'green',
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderLeftWidth: 10,
    borderRightColor: 'transparent',
    borderRightWidth: 10,
    borderStyle: 'solid',
    height: 0,
    transform: [
      {rotate: '180deg'}
    ],
    width: 0,
  },
});
 