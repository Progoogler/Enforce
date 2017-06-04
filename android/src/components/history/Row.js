import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import { NavigationActions } from'react-navigation';

const Row = (props) => (
  <View style={styles.container}>
    <View style={styles.rowContainer}>
      <Image
        style={styles.image}
        source={{uri: props.data.mediaUri}} />
      <View>
        { props.data.license ? <Text>License: {props.data.license}</Text> : null }
        { props.data.VIN ? <Text>VIN: {props.data.VIN}</Text> : null }
        <Text>Photo taken: {this._getPrettyTimeFormat(props.data.createdAt)}</Text>
        <Text>Ticketed: {this._getPrettyTimeFormat(props.data.ticketedAt)}</Text>
        <Text>Time limit: {this._getTimeLimitDesc(props.data.timeLength)}</Text>
      </View>
      <TouchableHighlight
        style={styles.button}
        underlayColor='#0099ff'
        onPress={() => this._openMapPage(props.data, props)} >
        <View>
          <Text style={styles.buttonText}>Show Map</Text>
        </View>
      </TouchableHighlight>
    </View>
  </View>
);

_getTimeLimitDesc = (timeLimit) => {
  if (timeLimit <= 1) {
    return `${timeLimit} hour`;
  } else {
    return `${timeLimit} hours`;
  }
}

_getPrettyTimeFormat = (createdAt) => {
  let date = new Date(createdAt);
  let hour = date.getHours();
  let minutes = date.getMinutes() + '';
  minutes = minutes.length === 1 ? '0' + minutes : minutes;
  let period = (hour < 12) ? 'AM' : 'PM';
  hour = (hour <= 12) ? hour : hour - 12;
  let str = date + '';
  str = str.slice(0, 10);
  return `${str} ${hour}:${minutes} ${period}`;
}

_openMapPage = (timer, props) => {
  const navigateAction = props.NavigationActions.navigate({
    routeName: 'Map',
    params: {timers: timer, historyView: true, navigation: props.navigation},
  });
  props.navigation.dispatch(navigateAction);
}

const styles = StyleSheet.create({
  container: {
    padding: 10
  },
  rowContainer: {
    flexDirection: 'row',
  },
  image: {
    height: 100,
    width: 100,
    marginRight: 15,
  },
  button: {
    backgroundColor: '#4286f4',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    height: 35,
  },
  buttonText: {
    color: 'white',
  }
});

export default Row;
