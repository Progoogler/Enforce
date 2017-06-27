import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { NavigationActions } from'react-navigation';
import PropTypes from 'prop-types';


/* global require */
export default class Row extends Component {
  constructor() {
    super();
    this.state = {
      mounted: false,
    }
    this.distLat;
    this.distLon;
  }

  render() {
    if (this.props.data.list.length <= 1 && !this.props.data.list[0].createdAt) return (<View style={{flex: 1, flexDirection: 'row'}}></View>);
    return (
          <ScrollView
            style={styles.innerScroll}
            horizontal={true}
            directionalLockEnabled={true}
            showsHorizontalScrollIndicator={false} >
            <View style={styles.innerContainer} >
              <TouchableOpacity
                activeOpacity={.6}
                onPress={() => this._openTimerListPage(this.props.data.list)} >

                <View style={styles.timerRow}>
                  <Text style={styles.timerRowLength}>
                    {  this.props.data.list.length < 10 ?
                       '   ' + this.props.data.list.length + ' ' :
                       this.props.data.list.length < 100 ?
                       ' ' + this.props.data.list.length + ' ' :
                       this.props.data.list.length }
                  </Text>
                  <View style={styles.separator} />
                  <Text style={styles.timerRowTime}>
                    { this.props.updateRows ? this.getTimeLeft(this.props.data.list[0]) : this.getTimeLeft(this.props.data.list[0]) }
                  </Text>
                </View>

              </TouchableOpacity>

              <View style={styles.distanceContainer}>
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={.8}
                  onPress={() => this._openMapPage(this.props.data.list)} >
                  <View>
                    <Text style={styles.buttonText}>Show Map</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.distance}>{ (this.props.updatedLocation === true) ? this._getDistance() : this.distance }</Text>
              </View>

              <TouchableOpacity
                style={styles.delete}
                activeOpacity={.8}
                onPress={() => {this.props.deleteRow(this.props.data.list)}} >
                <Image source={require('../../../../shared/images/bin.jpg')} />
              </TouchableOpacity>
            </View>
          </ScrollView>
    );
  }

  componentWillMount() {
    this._getDistance();
    this.timer = this.props.data.list;
  }

  componentDidMount() {
    const { width } = Dimensions.get('window');
    styles.innerContainer = {
      flexDirection: 'row',
      alignItems: 'center',
      width: width + 65,
      borderTopWidth: .5,
    }
    styles.timerRow = {
      flexDirection: 'row',
      alignItems: 'center',
      height: 105,
      width: width - 95,
    }
    this.setState({mounted: true});
  }

  getTimeLeft(timer: object): object {
    if (!timer) return;
    let timeLength = timer.timeLength * 60 * 60 * 1000;
    let timeSince = new Date() - timer.createdAt;
    let timeLeft = (timeLength - timeSince) / 1000;
      if (timeLeft < 0) {
      return <Text style={styles.timeUp}>Time is up!</Text>;
    } else if (timeLeft < 60) {
      return<Text style={styles.timeUp}>less than a minute {'\n'}remaining</Text>;
    } else if (timeLeft < 3600) {
      if (timeLeft < 300 ) return <Text style={styles.timeUp}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
      if (timeLeft < 3600 / 4) return <Text style={styles.timeUp}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
      return <Text style={styles.timeUpNear}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
    } else if (timeLeft > 3600) {
      return <Text style={styles.timeUpFar}>{Math.floor(timeLeft / 60 / 60)} hour {Math.floor((timeLeft % 3600) / 60)} minutes remaining</Text>;
    } else {
      return '';
    }
  }

  _getDistance(): string {
    let i = 0;
    while (i < this.props.data.list.length) {
      if (this.props.data.list[i].latitude !== 0) {
         this.distLat = this.props.data.list[i].latitude;
         this.distLong = this.props.data.list[i].longitude;
       }
      i++;
    }
    return this.getDistanceFromLatLon(this.props.latitude, this.props.longitude, this.distLat, this.distLong);
  }

  getDistanceFromLatLon(lat1: number, lon1: number, lat2: number, lon2: number): string {

    if (lat1 && lon1 && lat2 && lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
      var dLon = this.deg2rad(lon2-lon1);
      var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c * 0.621371; // Distance in miles
      if (d < 0.1) {
        d = '< .1 mile';
      } else if (d < 0.5) {
        d = '< .5 mile';
      } else if (d < 1) {
        d = '< 1 mile';
      } else {
        d = d.toFixed(1) + ' miles';
      }
      this.distance = d;
      return d;
    }
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  _openMapPage(timerList: object): undefined {
    const navigateAction = NavigationActions.navigate({
      routeName: 'Map',
      params: {timers: timerList, navigation: this.props.navigation},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  _openTimerListPage(timerList: object): undefined {
    const navigateAction = NavigationActions.navigate({
      routeName: 'Timers',
      params: {timers: timerList},
    });
    this.props.navigation.dispatch(navigateAction);
  }

}

Row.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  updateRows: PropTypes.number.isRequired,
  updatedLocation: PropTypes.bool.isRequired,
  deleteRow: PropTypes.func.isRequired,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
};

const styles = StyleSheet.create({
  innerScroll: {
    flex: 1,
    flexDirection: 'row',
  },
  timerRowLength: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 22,
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
  timeUpNear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4286f4',
  },
  timerRowTime: {
    paddingLeft: 12,
  },
  button: {
    backgroundColor: '#4286f4',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
  },
  delete: {
    position: 'absolute',
    right: 0,
  },
  separator: {
    marginLeft: 10,
    borderWidth: .5,
    height: 40,
  },
  distanceContainer: {
    flexDirection: 'column',
  },
  distance: {
    marginLeft: 10,
    marginTop: 5,
  },
});
