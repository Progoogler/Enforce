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
    backgroundColor: 'green',
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
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
  },
  ticketedButton: {
    flex: .5,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  timeContainer: {
    flexDirection: 'column',
  },
  timeLeft: {
    fontSize: 16,
  },
  timeCreatedAt: {
    color: '#4286f4',
    fontSize: 30,
  }
});



class Row extends Component {
  constructor() {
    super();
  }
  render() {
    console.log('render timer list');
    return (
      <View style={styles.container} >
        <Image
          style={styles.image}
          source={{uri: this.props.mediaUri}} />

          <TouchableHighlight
            style={styles.vinButton} >
            <Text style={styles.buttonText}> Get VIN </Text>
          </TouchableHighlight>

        <View style={styles.descriptionContainer}>
          <Text style={styles.timeLeft}>{this._getTimeLeft(this.props)}</Text>
          <View style={styles.timeContainer}>
          <Text style={styles.description}>Recorded at</Text>
          <Text style={styles.timeCreatedAt}>{this._getPrettyTimeFormat(this.props.createdAtDate)}</Text>
          </View>
        {/*<Text style={styles.description}>{this._getTimeLimitResponse(this.props.timeLength)}</Text>*/}
        </View>

        <View style={styles.buttonsContainer} >
          <View style={styles.rowButtonsContainers} >
            <TouchableHighlight
              style={styles.movedButton} >
              <Text style={styles.buttonText}> Expired </Text>
            </TouchableHighlight>
            <View style={styles.separator} />
            <TouchableHighlight
              style={styles.ticketedButton}

              {/* TODO */}

              onPress={() => this._updateList(this.props.key)}>
              <Text style={styles.buttonText}> Ticketed </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }

  _getPrettyTimeFormat(date) {
    // TODO 8:6 FIX
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    miuntes = minutes.length === 1 ? '0' + minutes : minutes;
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
