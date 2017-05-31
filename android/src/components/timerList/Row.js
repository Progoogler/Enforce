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
            <Text style={styles.timeCreatedAt}>{this._getPrettyTimeFormat(this.props.data.createdAt)}</Text>
          </View>
        </View>
        { this.props.data.description.length > 0 ?
        <View style={styles.locationContainer}>
          <Text style={styles.location}>{ `${this.props.data.description}` }</Text>
        </View>
        : null }
        <View style={styles.buttonsContainer} >
          <View style={styles.rowButtonsContainers} >
            <TouchableHighlight
              style={styles.rowButton}
              underlayColor='#0099ff'
              onPress={() => this.props.expiredFunc(this.props.data)} >
              <Text style={styles.buttonText}> Expired </Text>
            </TouchableHighlight>
            <View style={styles.separator} />
            <TouchableHighlight
              style={styles.rowButton}
              underlayColor='#0099ff'
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
    if (now - timer.createdAt >= timer.timeLength * 60 * 60 * 1000) {
      this.props.realm.write(() => {
        timer.ticketedAt = now / 1;
        this.props.realm.objects('Ticketed')[0]['list'].push(timer);
        this.props.realm.objects('Timers')[timer.index]['list'].shift();
      });
      console.log('ticketing', this.props.realm.objects('Ticketed')[0]['list'])
      this.props.Database.setUserTickets('test', this.props.realm.objects('Ticketed')[0]['list']);
      console.log('success');
      this.props.updateRows();
    } else {
      this.props.throwWarning(timer);
    }
  }

  _getPrettyTimeFormat(createdAt) {
    let date = new Date(createdAt);
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    return `${hour}:${minutes} ${period}`;
  }

  _getTimeLeft(timer) {
    let timeLength = timer.timeLength * 60 * 60 * 1000;
    let timeSince = new Date() - timer.createdAt;
    let timeLeft = (timeLength - timeSince) / 1000;
    let value = '';
    if (timeLeft < 0) {
      return value = <Text style={{fontSize: 20, fontWeight: 'bold', color: 'green'}}>Time is up!</Text>;
    } else if (timeLeft < 60) {
      return value = 'less than a minute remaining';
    } else if (timeLeft < 3600) {
      return value = Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining';
    } else if (timeLeft > 3600 && timeLeft < 7200) {
      return value = '1 hour ' + Math.floor((timeLeft - 3600) / 60) + ' minutes remaining';
    } else if (timeLeft > 7200 && timeLeft < 10800) {
      return value = '2 hours ' + Math.floor((timeLeft - 7200) / 60) + ' minutes remaining';
    } else if (timeLeft > 10800 && timeLeft < 14400) {
      return value = '3 hours ' + Math.floor((timeLeft - 10800) / 60) + ' minutes remaining';
    } else {
      return value = 'Over ' + Math.floor(timeLeft / 60 / 60) + ' hours remaining...';
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
  locationContainer: {
    position: 'absolute',
    marginTop: 330,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    paddingTop: 2,
    paddingBottom: 2,
  },
  location: {
    textAlign: 'center',
    color: '#4286f4',
    fontSize: 18,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 4,
    paddingTop: 4,
  },
});
