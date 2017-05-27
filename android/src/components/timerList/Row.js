import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';


export default class Row extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container} >
        <Image
          style={styles.image}
          source={{uri: this.props.data.mediaUri}} />
        <View style={styles.descriptionContainer}>
          <Text style={styles.timeLeft}>{this._getTimeLeft(this.props.data)}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.description}>Recorded at</Text>
            <Text style={styles.timeCreatedAt}>{this._getPrettyTimeFormat(this.props.data.createdAtDate)}</Text>
          </View>
        </View>
        <Text style={styles.location}>{this.props.data.description.length > 0 ? `@ ${this.props.data.description}` : ''}</Text>
        <View style={styles.buttonsContainer} >
          <View style={styles.rowButtonsContainers} >
            <TouchableHighlight
              style={styles.rowButton}
              onPress={() => this.props.expiredFunc(this.props.data)} >
              <Text style={styles.buttonText}> Expired </Text>
            </TouchableHighlight>
            <View style={styles.separator} />
            <TouchableHighlight
              style={styles.rowButton}
              onPress={() => this._uponTicketed(this.props.data)}>
              <Text style={styles.buttonText}> Ticketed </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }

  _onVinRequest() {
    let options = {
    }
  }

  _uponTicketed(timer) {
    let now = new Date();
    if (now - timer.createdAtDate >= timer.timeLength * 60 * 60 * 1000) {
      this.props.realm.write(() => {
        timer.ticketedAtDate = now;
        this.props.realm.objects('Ticketed')[0]['list'].push(timer);
        this.props.realm.objects('Timers')[timer.index]['list'].shift();
      });
      this.props.updateRows();
      console.log(this.props.realm.objects('Ticketed'), this.props.realm.objects('Timers'));
    } else {
      this.props.throwWarning(timer);
    }
  }

  _getPrettyTimeFormat(date) {
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
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
      return value = <Text style={{fontSize: 20, fontWeight: 'bold', color: 'green'}}>Time is up!</Text>;
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
      return value = Math.floor(timeLeft / 60 / 60) + ' hours remaining..';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: 400,
    //flex: .8,
  },
  activity: {
    flex: 1,
    zIndex: 10,
  },
  buttonsContainer: {
    alignSelf: 'stretch',
  },
  rowButtonsContainers: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: 'white',
    height: 60,
  },
  rowButton: {
    flex: .5,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  timeContainer: {
    flexDirection: 'column',
  },
  timeLeft: {
    fontSize: 18,
  },
  timeCreatedAt: {
    color: '#4286f4',
    fontSize: 30,
  },
  location: {
    fontSize: 18,
    marginTop: -10,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 4,
  },
});
