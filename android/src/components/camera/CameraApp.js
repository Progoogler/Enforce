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
import LocationInput from './LocationInput';

export class CameraApp extends Component {
  constructor() {
    super();
    this.state = {
      animating: false,
      modalVisible: false,
    };
    this.latitude = null;
    this.longitude = null;
    this.cameraId = null;
    this.count = 0;
    this.timeLimit = 1;
    this.description = "";
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
{/*     <View style={{zIndex: 10}} >
          <ActivityIndicator
            animating={this.state.animating}
            style={styles.activity}
            size='large' />
        </View> */}
        <LocationInput visibility={this.state.modalVisible} setModalVisible={this.setModalVisible.bind(this)} description={this.description}/>
        <Navigation navigation={this.props.navigation} />
        <SetTimeLimit onUpdateTimeLimit={this._onUpdateTimeLimit.bind(this)} realm={this.realm} />

        <View style={styles.cameraContainer} >
          <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            style={styles.preview}
            aspect={Camera.constants.Aspect.fill} >
          </Camera>
          <View style={styles.footer}>
            <TouchableHighlight
              onPress={() => this.setModalVisible()} >
              <Image
                style={styles.pinIcon}
                source={require('../../../../shared/images/pin.png')} />
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.capture}
              onPress={() => {
              this.takePicture();
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

  setModalVisible(desc) {
    this.setState({modalVisible: !this.state.modalVisible});
    this.description = desc;
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
    if (this.description.length === 0) {
      this.realm.write(() => {
        this.realm.objects('Timers')[this.count]['list'].push({
          index: this.count,
          latitude: this.latitude,
          longitude: this.longitude,
          createdAt: new Date() / 1000,
          createdAtDate: new Date(),
          ticketedAtDate: new Date(),
          timeLength: this.timeLimit, // TEST LENGTH TODO Build Time Length Adjuster/Setter
          mediaUri: data.mediaUri,
          mediaPath: data.path,
          description: "",
        });
      });
    } else {
      this.realm.write(() => {
        this.realm.objects('Timers')[this.count]['list'].push({
          index: this.count,
          latitude: this.latitude,
          longitude: this.longitude,
          createdAt: new Date() / 1000,
          createdAtDate: new Date(),
          ticketedAtDate: new Date(),
          timeLength: this.timeLimit, // TEST LENGTH TODO Build Time Length Adjuster/Setter
          mediaUri: data.mediaUri,
          mediaPath: data.path,
          description: this.description,
        });
      });
      this.description = "";
    }
        console.log(this.realm.objects('Timers'))
    this.setState({animating: false});
  }

  _onUpdateTimeLimit() {
    let timeLimit = this.realm.objects('TimeLimit');
    let timerSequence = this.realm.objects('TimerSequence');
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
    flexDirection: 'column',
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
