import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import { NavigationActions } from'react-navigation';

export default class Row extends Component {
  constructor() {
    super();
    this.state = {
      getImageText: `Get${'\n'}Photo`,
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>

          { this.props.selected === 'Today' ?
            <Image style={styles.image} source={{uri: this.props.data.mediaUri}} /> :
            <TouchableHighlight style={styles.getImageButton} onPress={() => {}}><Text>{this.state.getImageText}</Text></TouchableHighlight> }

          <View>
            { this.props.data.license ? <Text>License: {this.props.data.license}</Text> : null }
            { this.props.data.VIN ? <Text>VIN: {this.props.data.VIN}</Text> : null }
            <Text>Photo taken: {this._getPrettyTimeFormat(this.props.data.createdAt)}</Text>
            <Text>Ticketed: {this._getPrettyTimeFormat(this.props.data.ticketedAt)}</Text>
            <Text>Time limit: {this._getTimeLimitDesc(this.props.data.timeLength)}</Text>
          </View>
          <TouchableHighlight
            style={styles.button}
            underlayColor='#0099ff'
            onPress={() => this._openMapPage(this.props.data)} >
            <View>
              <Text style={styles.buttonText}>Show Map</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

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

  _openMapPage = (timer) => {
    const navigateAction = this.props.NavigationActions.navigate({
      routeName: 'Map',
      params: {timers: timer, historyView: true, navigation: this.props.navigation},
    });
    this.props.navigation.dispatch(navigateAction);
  }
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
  },
  getImageButton: {
    height: 100,
    width: 100,
    marginRight: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
