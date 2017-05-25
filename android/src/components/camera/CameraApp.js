import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import Camera from 'react-native-camera';
import RNFS from 'react-native-fs';
import Realm from 'realm';

import Navigation from '../home/Header';
import SetTimeLimit from './SetTimeLimit';

export class CameraApp extends Component {
  constructor() {
    super();
    this.state = {
      animating: false,
    };
    this.realm = new Realm();
    this.latitude = null;
    this.longitude = null;
    this.cameraId = null;
    this.count = 0;
    this.index = 0;
    this.timeLimit = 1;
  }

  static navigationOptions = {
    drawerLabel: 'Camera',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../parked_logo_72x72.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    )
  };

  render() {
    const store = this.context;
    console.log('time limit', this.timeLimit)
    return (
      <View style={styles.container} >
{/*        <View style={{zIndex: 10}} >
          <ActivityIndicator
            animating={this.state.animating}
            style={styles.activity}
            size='large' />
        </View> */}
        <Navigation navigation={this.props.navigation} />
        <SetTimeLimit onUpdateTimeLimit={this._onUpdateTimeLimit.bind(this)} />
        <View style={styles.cameraContainer} >
          <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            style={styles.preview}
            aspect={Camera.constants.Aspect.fill} >
          </Camera>
          <View style={styles.footer}>
            <Image
              style={styles.pinIcon}
              source={require('../../../../shared/images/pin.png')} />
            <TouchableHighlight
              style={styles.capture}
              onPress={() => {
              this.takePicture();
              console.log('SEQUENCE', this.realm.objects('TimerSequence'));
              for (let i = 0; i < this.realm.objects('Timers')[0]['list'].length; i++) {
                console.log(this.realm.objects('Timers')[0]['list'][i]);
              }
              console.log('first list length:', this.realm.objects('Timers')[0]['list'].length);
              console.log('timer count:', this.realm.objects('TimerSequence')[0].count);
            }} >
              <View></View>
            </TouchableHighlight>
            <Text
              style={styles.undo}
              onPress={this.deletePreviousPicture.bind(this)}>undo</Text>
          </View>
        </View>
      </View>
    );
  }

  componentWillMount() {
    const context = this;
    function success(position) {
      context.latitude = position.coords.latitude;
      context.longitude = position.coords.longitude;
      console.log(context.latitude, context.longitude);
    }
    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }
    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 10000,
      distanceFilter: 1
    };
    this.cameraId = navigator.geolocation.watchPosition(success, error, options);
    this.setCameraTime();
    this._setTimeLimit();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.cameraId);
  }

  setTimerCount(inc = '') {
    let timerSequence = this.realm.objects('TimerSequence');
    if (timerSequence.length === 0) {
      this.realm.write(() => {
        this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
      });
    }
    if (inc) {
      this.realm.write(() => {
        timerSequence[0].count = timerSequence[0].count++;
      });
      this.count++;
      return;
    }
    if (timerSequence.length > 0) {
      this.count = timerSequence[0].count;
    }
    // if (countObj === undefined) {
    //   this.realm.write(() => {
    //     this.realm.create('TimerCount', {count: 0});
    //   });
    // } else {
    //   this.count = countObj.count;
    // }
  }

  setCameraTime() {
    let timerSequence = this.realm.objects('TimerSequence'); console.log('TIMER SEQ', timerSequence);
    if (timerSequence.length === 0) {
      this.createNewTimerList();
      this.realm.write(() => {
        this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
      });
    } else {
      let timeSince = (new Date() / 1000) - timerSequence[0].timeAccessedAt;
      if (timeSince >= 900) {
        this.realm.write(() => {
          timerSequence[0].timeAccessedAt = new Date() / 1000;
        });
        this.setTimerCount('increment');
        this.createNewTimerList();
        return;
      } else {
        setTimeout(this.setCameraTime.bind(this), (900 - timeSince) * 1000);
      }
      this.setTimerCount();
    }
  }

  _setTimeLimit() {
    let timeLimit = this.realm.objects('TimeLimit');
    if (timeLimit.length > 0) {
      this.timeLimit = timeLimit[0].float;
    } else {
      this.realm.write(() => {
        this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
      });
    }
  }

  createNewTimerList() {
    this.realm.write(() => {
      this.realm.create('Timers', {list: []});
    });
  }

  takePicture() {
    this.setState({animating: true});
    const options = {};
    const context = this;
    //options.location = ...
    this.camera.capture({metadata: options})
      .then((data) => {
        context.savePicture(data);
      })
      .catch(err => console.error(err));
  }

  deletePreviousPicture() {
    // TODO Updating most recent picture may delay the deletion order
    // removing previous data before the most recent picture has updated to realm.
    const context = this;
    const length = this.realm.objects('Timers')[this.count]['list'].length;
    const timer = this.realm.objects('Timers')[this.count]['list'][length - 1];
    RNFS.unlink(timer.mediaPath)
    .then(() => {
      RNFS.exists(timer.mediaUri)
      . then(() => {
        context.realm.write(() => {
          context.realm.objects('Timers')[context.count]['list'].pop();
          context.realm.delete(timer);
        });
      })
      .catch((err) => {
        console.warn(err.message);
      })
    })
    .catch((err) => {
      console.warn(err.message);
    });
  }

  savePicture(data) {
    this.index = (this.index === null) ? 0 : this.index++;
    const context = this;
    console.log('SAVE TO ', context.count);
    this.realm.write(() => {
      this.realm.objects('Timers')[context.count]['list'].push({
        key: context.index,
        latitude: context.latitude,
        longitude: context.longitude,
        createdAt: new Date() / 1000,
        createdAtDate: new Date(),
        timeLength: context.timeLimit, // TEST LENGTH TODO Build Time Length Adjuster/Setter
        mediaUri: data.mediaUri,
        mediaPath: data.path,
      });
    });
    this.setState({animating: false});
  }

  _onUpdateTimeLimit() {
    console.log('TIME LIMIT UPDATES')
    let timeLimit = this.realm.objects('TimeLimit');
    let timerSequence = this.realm.objects('TimerSequence');
    console.log('TIMER SEQ COUNT', timerSequence);
    this.timeLimit = timeLimit[0].float;
    this.realm.write(() => {
      timerSequence[0].count = timerSequence[0].count + 1;
    });
    this.setTimerCount('increment');
    this.createNewTimerList();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    height: 80,
  },
  pinIcon: {
    marginLeft: 20,
  },
  capture: {
    backgroundColor: 'green',
    borderRadius: 100,
    padding: 30,
    margin: 4,
  },
  undo: {
    color: '#4286f4',
    marginRight: 20,
    fontSize: 20,
  }
});
