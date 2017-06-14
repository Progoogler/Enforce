import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  AsyncStorage,
  Vibration,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Camera from 'react-native-camera';
import { unlink, exists } from 'react-native-fs';
import Realm from 'realm';

import Navigation from '../navigation';
import SetTimeLimit from './SetTimeLimit';
import LocationInput from './LocationInput';

export default class CameraApp extends Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      newTimer: false,
    };
    this.latitude = null;
    this.longitude = null;
    this.cameraId = null;
    this.firstCapture = true;
    this.count = 0;
    this.pictureCount = 0;
    this.timeLimit = 1;
    this.description = "";
    this.locationService = false;
    this.deleting = false;
    this.realm = new Realm();
  }

  static navigationOptions = {
    drawerLabel: 'Camera',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../../../../shared/images/camera-blue.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container} >
        <LocationInput visibility={this.state.modalVisible} setModalVisible={this.setModalVisible.bind(this)} description={this.description}/>
        <Navigation navigation={this.props.navigation} />
        <SetTimeLimit onUpdateTimeLimit={this._onUpdateTimeLimit.bind(this)} newTimer={this.state.newTimer} realm={this.realm} />

        <View style={styles.cameraContainer} >
          <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            style={styles.preview}
            aspect={Camera.constants.Aspect.fill} >
          </Camera>
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={.6}
              onPress={() => this.setModalVisible()} >
              <Image
                style={styles.pinIcon}
                source={require('../../../../shared/images/pin.png')} />
            </TouchableOpacity>
            <TouchableHighlight
              style={styles.capture}
              onPress={() => {
              this.takePicture();
            }} >
              <View></View>
            </TouchableHighlight>
            <Text
              style={styles.undo}
              onPress={() => this.deletePreviousPicture(this.pictureCount) }>UNDO</Text>
          </View>
        </View>
      </View>
    );
}

  async componentWillMount() {
    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);

    this.success = (position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.realm.write(() => {
        this.realm.objects('Coordinates')[0].latitude = this.latitude;
        this.realm.objects('Coordinates')[0].longitude = this.longitude;
      });
      this.locationService = true;
    }
    this.error = (err) => {
      let realmCoords = this.realm.objects('Coordinates')[0];
      this.latitude = realmCoords.latitude;
      this.longitude = realmCoords.longitude;
      console.log('ERROR(' + err.code + '): ' + err.message);
    }
    this.options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 10000,
      distanceFilter: 1
    };

    if (settings.location) {
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: "<h2>Turn On Location ?</h2>Enforce wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/>",
          ok: "OK",
          cancel: "Continue without"
      }).then(() => {
        navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
        this.setCameraTime();
        this._setTimeLimit();
      }).catch(() => {
        this.latitude = 0;
        this.longitude = 0;
        this.setCameraTime();
        this._setTimeLimit();
      });
    } else {
      this.latitude = 0;
      this.longitude = 0;
      navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
      this.setCameraTime();
      this._setTimeLimit();
    }
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() { console.log('camera unmounts')
    this._mounted = false;
    clearTimeout(this._timeout);
  }

  setModalVisible(desc) {
    this._mounted && this.setState({modalVisible: !this.state.modalVisible});
    this.description = desc ? desc : '';
  }

  setTimerCount(inc = '') {
    let timerSequence = this.realm.objects('TimerSequence')[0];
    if (inc) {
      this.realm.write(() => {
        timerSequence.count++;
      });
      if (this.count < timerSequence.count) this.count = timerSequence.count;
      this.pictureCount = 0;
      return;
    }
    this.count = timerSequence.count;
    this.pictureCount = this.realm.objects('Timers')[this.count]['list'].length;
    if (this.pictureCount === 0) {
      this.realm.write(() => {
        this.realm.objects('TimerSequence')[0].timeAccessedAt = new Date() / 1;
      });
    }
  }

  setCameraTime() {
    if (!this.realm.objects('Timers')[0]) this.createNewTimerList();
    let timerSequence = this.realm.objects('TimerSequence')[0]; console.log('TIMER SEQ', timerSequence);
    let timeSince = new Date() - timerSequence.timeAccessedAt;
    if (timeSince >= 900000) {
      this.realm.write(() => {
         timerSequence.timeAccessedAt = new Date() / 1;
      });
      this.setTimerCount('increment');
      this.createNewTimerList();
      return;
    } else {
      this._timeout = setTimeout(this.setCameraTime.bind(this), 900000 - timeSince);
    }
    this.setTimerCount();
  }

  _setTimeLimit() {
    this.timeLimit = this.realm.objects('TimeLimit')[0].float;
  }

  _showNotification() {
    this.setState({newTimer: true});
    setTimeout(() => this._mounted && this.setState({newTimer: false}), 2000);
  }

  createNewTimerList() {
    Vibration.vibrate();
    this._showNotification();
    this.realm.write(() => {
      this.realm.create('Timers', {list: []});
    });
  }

  takePicture() {
    this.pictureCount++;
    console.log('TAKING PICTURE', this.pictureCount)
    if (this.locationService) navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
    const options = {};
    //options.location = ...
    this.camera.capture({metadata: options})
      .then((data) => {
        if (this.firstCapture) {
          setTimeout(() => {
            this.savePicture(data);
          }, 2000);
          this.firstCapture = false;
          return;
        }
        this.savePicture(data);
      })
      .catch(err => console.error(err));
  }

  deletePreviousPicture(pictureCount) { console.log('deleting', pictureCount - 1)
    // TODO Updating most recent picture may delay the deletion order
    // removing previous data before the most recent picture has updated to realm.
    if (!this.deleting) {
      Vibration.vibrate();
      if (pictureCount > 1) this.pictureCount--;
      this.deleting = true;
    }
    const length = this.realm.objects('Timers')[this.count]['list'].length;
    const timer = this.realm.objects('Timers')[this.count]['list'][pictureCount - 1];
    if (!timer) {
      setTimeout(() => {
        console.log('set time out current deletion', pictureCount)
        this.deletePreviousPicture(pictureCount);
      }, 5000);
      return;
    }
    if (length - 1 < 0) return;
    console.log('unlinking')
    unlink(timer.mediaPath)
    .then(() => {
      console.log('FILE DELETED');
      exists(timer.mediaUri)
      .then(() => {
        console.log('PICTURE REMOVED');
        this.realm.write(() => {
          this.realm.objects('Timers')[this.count]['list'].splice(pictureCount - 1, 1);
          this.realm.delete(timer);
        });
      })
      .catch((err) => {
        console.warn(err.message);
      })
    })
    .catch((err) => {
      console.warn(err.message);
    });
    this.deleting = false;
  }

  savePicture(data) { console.log("this.desc", this.description)
    if (this.description && this.description.length === 0) {
      this.realm.write(() => {
        this.realm.objects('Timers')[this.count]['list'].push({
          index: this.count,
          latitude: this.latitude,
          longitude: this.longitude,
          createdAt: new Date() / 1,
          ticketedAt: 0,
          timeLength: this.timeLimit, // TEST LENGTH TODO Build Time Length Adjuster/Setter
          license: '',
          VIN: '',
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
          createdAt: new Date() / 1,
          ticketedAt: 0,
          timeLength: this.timeLimit, // TEST LENGTH TODO Build Time Length Adjuster/Setter
          license: '',
          VIN: '',
          mediaUri: data.mediaUri,
          mediaPath: data.path,
          description: this.description,
        });
      });
      this.description = "";
    }
  }

  _onUpdateTimeLimit(newLimit) {
    this.realm.write(() => {
      this.realm.objects('TimerSequence')[0].timeAccessedAt = new Date() / 1;
    });
    this.timeLimit = newLimit;
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
    flex: .8,
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
    backgroundColor: 'rgba(0, 0, 0, 1)',
    height: 80,
  },
  pinIcon: {
    marginLeft: 20,
  },
  capture: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 100,
    padding: 30,
    margin: 4,
    marginLeft: 18,
  },
  undo: {
    color: '#4286f4',
    marginRight: 20,
    fontSize: 20,
  },
});
