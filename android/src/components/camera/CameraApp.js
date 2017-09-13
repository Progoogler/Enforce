import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  AsyncStorage,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { unlink } from 'react-native-fs';
import Realm from 'realm';
import ALPR from 'react-native-openalpr';
import Camera from 'react-native-camera';

import Navigation from '../navigation';
import SetTimeLimit from './SetTimeLimit';
import LocationInput from './LocationInput';
import Capture from './Capture';

export default class CameraApp extends Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      newTimer: false,
      imageRecognition: true,
    };
    this._retry = 0;
    this.license = '';
    this.latitude = null;
    this.longitude = null;
    this.camera = null;
    this.firstCapture = true;
    this.listIndex = 0;
    this.pictureCount = 0;
    this.timeLimit = 1;
    this.description = "";
    this.locationService = false;
    this.deleting = false;
    this._mounted = undefined;
    this.settings = null;
    this.realm = new Realm();
  }

  static navigationOptions = {
    drawerLabel: 'Camera',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/camera-blue.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container} >
        <LocationInput visibility={this.state.modalVisible} setModalVisible={this.setModalVisible.bind(this)} />
        <Navigation navigation={this.props.navigation} />
        <SetTimeLimit onUpdateTimeLimit={this._onUpdateTimeLimit.bind(this)} newTimer={this.state.newTimer} realm={this.realm} />

        <View style={styles.cameraContainer}>


        {this.state.imageRecognition ?

          <ALPR
            ref={(cam) => this.camera = cam}
            style={styles.camera}
            aspect={ALPR.constants.Aspect.fill}
            captureQuality={ALPR.constants.CaptureQuality.medium}
            country='us'
            onPlateRecognized={(data) => this._onPlateRecognized(data)}
            plateOutlineColor='#ff0000'
            showPlateOutline
            torchMode={ALPR.constants.TorchMode.off}
            touchToFocus/>

          :

          <Camera
           ref={(cam) => this.camera = cam}
           style={styles.camera}
           aspect={Camera.constants.Aspect.fill}
           captureQuality={Camera.constants.CaptureQuality.high}/>

        }


        </View>
        <Capture setModalVisible={this.setModalVisible.bind(this)} takePicture={this.takePicture.bind(this)} deletePreviousPicture={this.deletePreviousPicture.bind(this)} />
      </View>
    );
}

  async componentWillMount() {
    this.settings = await AsyncStorage.getItem('@Enforce:settings');
    this.settings = JSON.parse(this.settings);
    if (this.settings && !this.settings.imageRecognition) this.setState({imageRecognition: false});
  }

  componentDidMount() {
    this._mounted = true;
    this._setCameraTime();
    this._setTimeLimit();

    if (this.settings && this.settings.location) {
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: "<h2>Turn On Location ?</h2>Enforce wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/>",
          ok: "OK",
          cancel: "Continue without"
      }).then(() => {
        navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
      }).catch(() => {
        this.latitude = 0;
        this.longitude = 0;
      });
    } else {
      this.latitude = 0;
      this.longitude = 0;
      navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    clearTimeout(this._timeout);
  }

  success = (position) => {
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    this.realm.write(() => {
      this.realm.objects('Coordinates')[0].latitude = this.latitude;
      this.realm.objects('Coordinates')[0].longitude = this.longitude;
    });
    this.locationService = true;
  }

  error = (err) => {
    let realmCoords = this.realm.objects('Coordinates')[0];
    this.latitude = realmCoords.latitude;
    this.longitude = realmCoords.longitude;
  }

  options = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10000,
    distanceFilter: 1
  };

  setModalVisible(desc?: string = '') {
    this._mounted && this.setState({modalVisible: !this.state.modalVisible});
    this.description = desc;
  }

  _setCameraTime() {
    if (!this.realm.objects('Timers')[0]) this._createNewTimerList();
    let timerSequence = this.realm.objects('TimerSequence')[0];
    let timeSince = new Date() - timerSequence.timeAccessedAt;
    if (timeSince >= 900000) { // Start a new timer group after every 15 minutes
      this.realm.write(() => {
         timerSequence.timeAccessedAt = new Date() / 1;
      });
      this._setTimerCount('increment');
      this._createNewTimerList();
      return;
    } else {
      // Start new timer after remaining milliseconds reach 15 minutes
      this._timeout = setTimeout(this._setCameraTime.bind(this), 900000 - timeSince);
    }
    this._setTimerCount();
  }

  // Keep track of the length of the number of timers in each Timer list
  _setTimerCount(inc: string = '') {
    let timerSequence = this.realm.objects('TimerSequence')[0];
    if (inc) {
      this.realm.write(() => {
        timerSequence.count++;
      });
      if (this.listIndex < timerSequence.count) this.listIndex = timerSequence.count;
      this.pictureCount = 0;
      return;
    }
    this.listIndex = timerSequence.count;
    this.pictureCount = this.realm.objects('Timers')[this.listIndex]['list'].length;
    if (this.pictureCount === 0) {
      this.realm.write(() => {
        this.realm.objects('TimerSequence')[0].timeAccessedAt = new Date() / 1;
      });
    }
  }

  takePicture(retry) {
    if (!retry) {
      this.pictureCount++;

      if (this.locationService) {
        navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
      }
    }

    if (this.camera === null) {
      setTimeout(() => this.takePicture(), 500);
      return;
    }
    this.camera.capture()
      .then((data) => {
        if (this.firstCapture) {
          setTimeout(() => {
            this.savePicture(data);
          }, 1200);
          this._retry = 0;
          this.firstCapture = false;
          return;
        }
        this.savePicture(data);
        this._retry = 0;
      })
      .catch(err => {
        this._retry++;
        if (this._retry !== 3) {
          this.takePicture('retry');
        } else {
          this._retry = 0;
        }
      });
  }

  deletePreviousPicture(pictureCount?: number) {
    if (!this.deleting) {
      Vibration.vibrate();
      if (this.pictureCount > 1) this.pictureCount--;
      this.deleting = true;
    }
    const length = this.realm.objects('Timers')[this.listIndex]['list'].length;
    const timer = this.realm.objects('Timers')[this.listIndex]['list'][pictureCount ? pictureCount - 1 : this.pictureCount - 1];
    if (!timer && this.pictureCount - 1 >= 0) {
      setTimeout(() => {
        pictureCount ? this.deletePreviousPicture(pictureCount) : this.deletePreviousPicture(this.pictureCount);
      }, 2500);
      return;
    } else {
      this.deleting = false;
    }
    if (length - 1 < 0) return;
    unlink(timer.mediaPath)
      .then(() => {
        this.realm.write(() => {
          this.realm.objects('Timers')[this.listIndex]['list'].splice(pictureCount ? pictureCount - 1 : this.pictureCount - 1, 1);
          this.realm.delete(timer);
        });
      })
      .catch((err) => {
        console.warn(err.message);
      });
    this.deleting = false;
  }

  savePicture(data: object) {
    if (this.description && this.description.length === 0) {
      this.realm.write(() => {
        this.realm.objects('Timers')[this.listIndex]['list'].push({
          index: this.listIndex,
          latitude: this.latitude,
          longitude: this.longitude,
          createdAt: new Date() / 1,
          ticketedAt: 0,
          timeLength: this.timeLimit,
          license: this.license,
          VIN: '',
          mediaUri: data.mediaUri,
          mediaPath: data.path,
          description: "",
        });
      });
    } else {
      this.realm.write(() => {
        this.realm.objects('Timers')[this.listIndex]['list'].push({
          index: this.listIndex,
          latitude: this.latitude,
          longitude: this.longitude,
          createdAt: new Date() / 1,
          ticketedAt: 0,
          timeLength: this.timeLimit,
          license: this.license,
          VIN: '',
          mediaUri: data.mediaUri,
          mediaPath: data.path,
          description: this.description,
        });
      });
      this.description = "";
    }
    this.license = '';
    // console.log('saved data:', this.realm.objects('Timers')[this.listIndex]['list'][this.realm.objects('Timers')[this.listIndex]['list'].length - 1]);
  }

  _setTimeLimit() {
    this.timeLimit = this.realm.objects('TimeLimit')[0].float;
  }

  _showNotification() {
    this._mounted && this.setState({newTimer: true});
    setTimeout(() => this._mounted && this.setState({newTimer: false}), 2000);
  }

  _onUpdateTimeLimit(newLimit: number) {
    this.realm.write(() => {
      this.realm.objects('TimerSequence')[0].timeAccessedAt = new Date() / 1;
    });
    this.timeLimit = newLimit;
    this._setTimerCount('increment');
    this._createNewTimerList();
  }


    _createNewTimerList() {
      Vibration.vibrate();
      this._showNotification();
      this.realm.write(() => {
        this.realm.create('Timers', {list: []});
      });
    }

  _onPlateRecognized({ plate, confidence }) {

    if (confidence > 0.9) {
      this.license = plate;
      console.log('plate recognized', this.license);
    }
  }
}

CameraApp.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  cameraContainer: {
    flex: .8,
    flexDirection: 'column',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
