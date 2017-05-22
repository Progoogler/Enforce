import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: 400,
    //flex: .8,
  },
  buttonsContainer: {
    //alignItems: 'center',
    //justifyContent: 'center',
    alignSelf: 'stretch',
  },
  vinButton: {
    alignSelf: 'stretch',
    borderColor: 'green',
    borderWidth: 2,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowButtonsContainers: {
    flex: 1,
    flexDirection: 'row',
    height: 60,
  },
  movedButton: {
    flex: .5,
    borderColor: 'green',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketedButton: {
    flex: .5,
    borderColor: 'green',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    //flex: .2,
  },
});



class Row extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <View style={styles.container} >
        <Image
          style={styles.image}
          source={{uri: this.props.mediaUri}} />

        <Text style={styles.description}>{this._getTimeLeft(this.props)}</Text>
        <Text style={styles.description}>Recorded at {this._getPrettyTimeFormat(this.props.createdAtDate)}</Text>
        <Text style={styles.description}>{this._getTimeLimitResponse(this.props.timeLength)}</Text>

        <View style={styles.buttonsContainer} >
          <TouchableHighlight
            style={styles.vinButton} >
            <Text> Get VIN </Text>
          </TouchableHighlight>
          <View style={styles.rowButtonsContainers} >
            <TouchableHighlight
              style={styles.movedButton} >
              <Text> Moved </Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.ticketedButton}
              onPress={() => this._updateList(this.props.key)}>
              <Text> Ticketed </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }

  _getTimeLimitResponse(length) {
    if (length < 1) {
      return `${length} minute time limit`;
    } else {
      return `${length} hour time limit`;
    }
  }

  _getPrettyTimeFormat(date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    return `${hour}:${minutes} ${period}`;
  }

  _getTimeLeft(timer) {
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

export default Row;
