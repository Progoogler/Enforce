import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import NavigationActions from 'react-navigation';

import ImageModal from '../history/ImageModal';

export default class Result extends Component {
  constructor() {
    super();
    this.state = {
      showMaximizedImage: false,
      uri: '',
    }
  }

  render() {
    return (
      <View
        style={{
          height: 120,
          alignSelf: 'stretch',
          backgroundColor: '#4286f4',
          padding: 15,
          zIndex: 10,
        }} >

        { this.state.showMaximizedImage ? <ImageModal
            navigation={this.props.navigation}
            uri={this.state.uri}
            visibility={this.state.showMaximizedImage}
            maximizeImage={this.maximizeImage.bind(this)} /> : null }

        {
          typeof this.props.data.data === 'object' ?
          <View style={styles.container}>
            <TouchableOpacity onPress={() => this.maximizeImage(this.props.data.data.mediaUri)}>
              <Image source={{uri: this.props.data.data.mediaUri}} style={styles.image} />
            </TouchableOpacity>
              <View style={styles.dataContainer}>
                { this.props.data.data.license ? <Text>License: {this.props.data.data.license}</Text> : null }
                { this.props.data.data.VIN ? <Text>VIN: {this.props.data.data.VIN}</Text> : null }
                <Text>Photo taken: {this._getPrettyTimeFormat(this.props.data.data.createdAt)}</Text>
                { this.props.data.data.ticketedAt !== 0 ? <Text>Ticketed: {this._getPrettyTimeFormat(this.props.data.data.ticketedAt)}</Text> : null }
                <Text>Time limit: {this._getTimeLimitDesc(this.props.data.data.timeLength)}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => this._openMapPage(this.props.data.data)} >
                  <Image source={require('../../../../shared/images/blue-pin.png')} style={styles.mapIcon} />
                </TouchableOpacity>
              </View>
            </View>
            :

            null

        }
      </View>
    );
  }
  // <View>
  //   <Text style={styles.buttonText}>Show Map</Text>
  //   </View>

  componentWillMount() {
    // console.log('result mounts')
    // if (this.props.extendMenuContainer) this.props.extendMenuContainer(true);
  }

  _getTimeLimitDesc = (timeLimit) => {
    if (timeLimit < 1) {
      return `${timeLimit * 60} minutes`;
    } else {
      return `${timeLimit} ${timeLimit === 1 ? 'hour' : 'hours'}`;
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

  maximizeImage(uri) {
    if (uri) {
      this.setState({showMaximizedImage: true, uri: uri});
    } else {
      this.setState({showMaximizedImage: false, uri: ''});
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  image: {
    height: 100,
    width: 100,
    marginRight: 15,
    flex: .3,
  },
  dataContainer: {
    flex: .7,
    padding: 10,
  },
  // maximizeImage: {
  //   height: 100,
  //   width: 100,
  //   marginRight: 15,
  // },
  // activity: {
  //   position: 'absolute',
  //   alignSelf: 'center',
  //   left: 40,
  // },
  button: {
  //   backgroundColor: '#4286f4',
    position: 'absolute',
    bottom: 0,
    right: 0,
  //   borderWidth: 1,
  //   borderRadius: 5,
  //   padding: 5,
  //   height: 35,
  // },
  // buttonText: {
  //   color: 'white',
  },
  mapIcon: {
    height: 45,
    width: 35,
  },
});
