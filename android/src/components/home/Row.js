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
    this.state = {
      mounted: false,
    }
  }

  render() {
    if (this.props.list.length < 1) return (<View style={{flex: 1, flexDirection: 'row'}}></View>);
    return (
          <ScrollView
            style={styles.innerScroll}
            horizontal={true}
            directionalLockEnabled={true}
            showsHorizontalScrollIndicator={false} >
            <View style={styles.innerContainer} >
              <TouchableHighlight
                onPress={() => this._openTimerListPage(this.props.list)}
                underlayColor="white" >
                <View style={styles.timerRow}>
                  <Text style={styles.timerRowLength}>
                    { this.props.list.length /*(this.props.list.length > 1) ? this.props.list.length + '\n cars' : '1 \n car' */}
                  </Text>
                  <View style={styles.separator} />
                  <Text style={styles.timerRowTime}>
                    { this.getTimeLeft(this.props.list[0]) }
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={styles.button}
                underlayColor='#0099ff'
                onPress={() => this._openMapPage(this.props.list)} >
                <Text style={styles.buttonText}>Show Map</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={styles.delete}
                onPress={() => {this.props.deleteRow(this.props.list)}} >
                <Image source={require('../../../../shared/images/bin.jpg')} />
              </TouchableHighlight>
            </View>
          </ScrollView>
    );
  }

  componentDidMount() {
    const {height, width} = Dimensions.get('window');
    styles.innerContainer = {
      flexDirection: 'row',
      alignItems: 'center',
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
    this.setState({mounted: true});
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
      routeName: 'Timers',
      params: {timers: timerList},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  getTimeLeft(timer) {
    if (!timer) return;
    let timeLength = timer.timeLength * 60 * 60 * 1000;
    let timeSince = new Date() - timer.createdAt;
    let timeLeft = (timeLength - timeSince) / 1000;
    let value = '';
      if (timeLeft < 0) {
      return <Text style={styles.timeUp}>Time is up!</Text>;
    } else if (timeLeft < 60) {
      return<Text style={styles.timeUp}>less than a minute {'\n'}remaining</Text>;
    } else if (timeLeft < 3600) {
      if (timeLeft < 300 ) return <Text style={styles.timeUp}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
      if (timeLeft < 3600 / 4) return <Text style={styles.timeUp}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
      return <Text style={styles.timeCaution}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
    } else if (timeLeft > 3600) {
      return <Text style={styles.timeUpFar}>{Math.floor(timeLeft / 60 / 60)} hour {Math.floor((timeLeft - 3600) / 60)} minutes remaining</Text>;
    } else {
      return '';
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
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 30,
    textAlign: 'center',
    color: '#4286f4',
  },
  timeUp: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'green',
  },
  timeUpFar: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeCaution: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4286f4',
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
  },
  separator: {
    marginLeft: 35,
    borderWidth: .5,
    height: 40,
  },
});
