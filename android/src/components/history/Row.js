import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import { NavigationActions } from'react-navigation';

export default class Row extends Component {
  constructor() {
    super();
    this.state = {
      getImageText: `Get${'\n'}Photo`,
      image: [],
      animating: false,
    }
  }

  render() {
    console.log('row')
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          {
            (this.props.selected === "Today's Ticketed" || this.props.selected === "Today's Expired") ?
            <TouchableWithoutFeedback onPress={() => this.props.maximizeImage(this.props.data.mediaUri)}>
              <Image style={styles.image} source={{uri: this.props.data.mediaUri}} />
            </TouchableWithoutFeedback>
            :
            <TouchableHighlight style={styles.getImageButton} onPress={() => this._getImageFromDatabase() }>
              { this.state.image.length === 0 ? <Text style={styles.getImageText}>{this.state.getImageText}</Text> : this.state.image[0] }
            </TouchableHighlight>
          }

          <ActivityIndicator style={styles.activity} animating={this.state.animating} size='small' />
          <View>
            { this.props.data.license ? <Text>License: {this.props.data.license}</Text> : null }
            { this.props.data.VIN ? <Text>VIN: {this.props.data.VIN}</Text> : null }
            <Text>Photo taken: {this._getPrettyTimeFormat(this.props.data.createdAt)}</Text>
            { this.props.data.ticketedAt !== 0 ? <Text>Ticketed: {this._getPrettyTimeFormat(this.props.data.ticketedAt)}</Text> : null }
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

  componentWillUpdate() {
    if (this.props.dateTransition) {
      this.setState({image: []});
    }
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

  _getImageFromDatabase() {
    this.setState({animating: true});
    let date = new Date(this.props.data.createdAt);
    let datePath=`${date.getMonth() + 1}-${date.getDate()}`;
    let refPath = `${this.props.userSettings.county}/${this.props.userId}/${datePath}`;
    this.props.getTicketImage(refPath, '1496530142627', (url) => {
      if (url === null) {
        this.setState({
          image: [<View style={styles.getImageButton}><Text style={styles.getImageText}>Photo {'\n'}not{'\n'}available</Text></View>],
          animating: false,
        });
      } else {
        this.setState({
          image: [<TouchableWithoutFeedback onPress={() => this.props.maximizeImage(url)}><Image style={{alignSelf: 'center', height: 400, width: 300}} source={{ uri: url }} /></TouchableWithoutFeedback>],
          animating: false,
        });
      }
    });
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
  activity: {
    position: 'absolute',
    alignSelf: 'center',
    left: 40,
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
    backgroundColor: 'black',
    height: 100,
    width: 100,
    marginRight: 15,
    borderWidth: 1,
    justifyContent: 'center',
  },
  getImageText: {
    color: 'white',
    textAlign: 'center',
  }
});
