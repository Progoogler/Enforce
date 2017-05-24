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
    this.latitude = null;
    this.longitude = null;
    this.cameraId = null;
    this.count = 0;
    this.index = 0;
    this.timeLimit = 1;
    this.realm = new Realm();
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
            <Image source={require('../../../../shared/images/pin.jpg')} />
            <TouchableHighlight
              style={styles.capture}
              onPress={() => {
              this.takePicture();
              console.log(this.realm.objects('CameraTime'));
              for (let i = 0; i < this.realm.objects('Timers')[0]['list'].length; i++) {
                console.log(this.realm.objects('Timers')[0]['list'][i]);
              }
              console.log('first list length:', this.realm.objects('Timers')[0]['list'].length);
              console.log('timer count:', this.realm.objects('TimerCount'));
            }} >
              <View></View>
            </TouchableHighlight>
            <Text>undo</Text>
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
    this.setTimerCount();
    this.setCameraTime();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.cameraId);
  }

  setTimerCount(inc = '') {
    let countObj = this.realm.objects('TimerCount')[0];
    if (inc) {
      let currentCount = countObj.count;
      this.realm.write(() => {
        countObj.count = currentCount + 1
      });
      this.count = currentCount + 1;
      return;
    }

    if (countObj === undefined) {
      this.realm.write(() => {
        this.realm.create('TimerCount', {count: 0});
      });
    } else {
      this.count = countObj.count;
    }
  }

  setCameraTime() {
    let cameraTime = this.realm.objects('CameraTime')[0];
    if (cameraTime === undefined) {
      this.createNewTimerList();
      this.realm.write(() => {
        this.realm.create('CameraTime', {timeAccessedAt: new Date() / 1000});
      });
    } else {
      let timeSince = (new Date() / 1000) - cameraTime.timeAccessedAt;
      if (timeSince >= 900) {
        let cameraAccessTime = this.realm.objects('CameraTime')[0];
        this.realm.write(() => {
          cameraAccessTime.timeAccessedAt = new Date() / 1000;
        });
        this.createNewTimerList();
        this.setTimerCount('increment');
      } else {
        setTimeout(this.setCameraTime.bind(this), (900 - timeSince) * 1000);
      }
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
        console.log('save picture')
        context.savePicture(data);
        console.log(data)
      })
      .catch(err => console.error(err));
  }

  deletePreviousPicture() {
    // TODO Build a delete button.
    // TODO Updating most recent picture may delay the deletion order
    // removing previous data before the most recent picture has updated to realm.
    const context = this;
    const length = this.realm.objects('Timers')[this.count]['list'].length;
    const timer = this.realm.objects('Timers')[this.count]['list'][length - 1];
    RNFS.unlink(timer.mediaPath)
    .then(() => {
      console.log('FILE DELETED');
      RNFS.exists(timer.mediaUri)
      . then(() => {
        console.log('PICTURE REMOVED');
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
    console.log(this.realm.objects('Timers'), context.count, context.latitude);
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

  _onUpdateTimeLimit(timeLimit) {

    this.setState({timeLimit});
    console.log(this.state.timeLimit);
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
  },
  capture: {
    backgroundColor: 'green',
    borderRadius: 100,
    padding: 4,
    margin: 4,
  },
});
