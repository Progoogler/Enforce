import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableHighlight,
} from 'react-native';
import { NavigationActions } from'react-navigation';

export default class Row extends Component {
  constructor() {
    super();
  }

  render() {
    const {height, width} = Dimensions.get('window');
    styles.innerContainer = {
      flexDirection: 'row',
      alignItems: 'center',
      //justifyContent: 'space-between',
      width: width + 65,
      borderTopWidth: .5,
    }
    styles.button = {
      backgroundColor: '#4286f4',
      borderWidth: 1,
      borderRadius: 5,
      padding: 5,
    }
    styles.timerRow = {
      flexDirection: 'row',
      alignItems: 'center',
      height: 105,
      width: width - 95,
    }

    return (

            <ScrollView
              horizontal={true}
              directionalLockEnabled={true}
              style={styles.innerScroll} >
              <View style={styles.innerContainer} >
                <TouchableHighlight
                  onPress={() => this._openTimerListPage(this.props.list)} >
                  <View style={styles.timerRow}>
                    <Text style={styles.timerRowLength}>
                      { (this.props.list.length > 1) ? this.props.list.length + '\n cars' : '1 \n car' }
                    </Text>
                    <Text style={styles.timerRowTime}>
                      { this.getTimeLeft(this.props.list[0]) }
                    </Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  style={styles.button}
                  onPress={() => this._openMapPage(this.props.list)} >
                  <Text style={styles.buttonText}>Show Map</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={styles.delete}
                  onPress={() => {}} >
                  <Image source={require('../../../../shared/images/bin.jpg')} />
                </TouchableHighlight>
              </View>
            </ScrollView>

    );
  }

  componentWillMount() {

  }

  _openMapPage(timerList) {
    const navigateAction = NavigationActions.navigate({
      routeName: 'Map',
      params: {timers: timerList, navigation: this.props.navigation},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  _openTimerListPage(timerList) {
    const navigateAction = NavigationActions.navigate({
      routeName: 'TimerList',
      params: {timers: timerList},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  getTimeLeft(timer) {
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
  // timerRowContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   borderTopWidth: 1,
  // },

  //   container: {
  //   //flex: 1,
  //   //flexDirection: 'row'
  // },
  innerScroll: {
    flex: 1,
    flexDirection: 'row',
  },

  timerRowLength: {
    fontSize: 20,
    paddingLeft: 30,
    textAlign: 'center',
  },
  timerRowTime: {
    paddingLeft: 35,
  },
  buttonText: {
    color: 'white',
  },
  delete: {
    position: 'absolute',
    right: 0,
  }
});
