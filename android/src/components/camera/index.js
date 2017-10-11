import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import ALPR from 'react-native-openalpr';
import Camera from 'react-native-camera';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import PropTypes from 'prop-types';
import Realm from 'realm';
import { unlink } from 'react-native-fs';

import Capture from './Capture';
import LocationInput from './LocationInput';
import Navigation from '../navigation/StaticNavigation';
import SetTimeLimit from './SetTimeLimit';

export default class CameraApp extends Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      newTimer: false,
    };
    this.camera = null;
    this.deleting = false;
    this.description = '';
    this.firstCapture = true;
    this.latitude = null;
    this.license = '';
    this.listIndex = 0;
    this.locationMemory = {
      avgLatDiff: 0,
      avgLongDiff: 0,
      locations: [],
      time: null,
    };
    this.longitude = null;
    this.mounted = false;
    this.pictureCount = 0;
    this.realm = new Realm();
    this.resetTimeLimit = null;
    this.timeLimit = 1;
  }

  static navigationOptions = {
    drawerLabel: 'Camera',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/camera-blue.png')}/>
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <LocationInput visibility={this.state.modalVisible} setModalVisible={this.setModalVisible.bind(this)} />
        <Navigation navigation={this.props.navigation} title={'Enforce'}/>
        <SetTimeLimit onUpdateTimeLimit={this._onUpdateTimeLimit.bind(this)} newTimer={this.state.newTimer} realm={this.realm} />

        <View style={styles.cameraContainer}>

        {
          this.props.screenProps.imageRecognition ?
          
          <ALPR
            aspect={ALPR.constants.Aspect.fill}
            captureQuality={ALPR.constants.CaptureQuality.medium}
            country='us'
            onPlateRecognized={(data) => this._onPlateRecognized(data)}
            plateOutlineColor='#ff0000'
            ref={(cam) => this.camera = cam}
            showPlateOutline
            style={styles.camera}
            touchToFocus
            torchMode={ALPR.constants.TorchMode.off}
          />

          :

          <Camera
            aspect={Camera.constants.Aspect.fill}
            captureQuality={Camera.constants.CaptureQuality.high}
            ref={(cam) => this.camera = cam}
            style={styles.camera}
          />
          
        }
        </View>
        <Capture 
          deletePreviousPicture={this.deletePreviousPicture.bind(this)} />
          setModalVisible={this.setModalVisible.bind(this)} 
          takePicture={this.takePicture.bind(this)} 
      </View>
    );
}


  async componentDidMount() {
    this.mounted = true;

    this._setCameraTime();
    this._setTimeLimit();  

    if (this.props.screenProps.locationReminder) {
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
    this.mounted = false;
    clearTimeout(this.resetTimeLimit);
  }

  success = (position) => {
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;

    console.log('regular coords', this.latitude, this.longitude);

    var now = new Date();
    if (this.locationMemory.locations.length === 4) {

      if (now - this.locationMemory.time > 30000) {
        this.locationMemory.locations = [];
        this.locationMemory.locations.push({
          lat: this.latitude,
          long: this.longitude,
        });
      } else {

        this.locationMemory.locations.push({
          lat: this.latitude,
          long: this.longitude,
        });

        var latDiffSum = 0,
            longDiffSum = 0;
        for (let i = 1; i < 5; i++) {
          latDiffSum += this.locationMemory.locations[i].lat - this.locationMemory.locations[i - 1].lat;
          longDiffSum += this.locationMemory.locations[i].long - this.locationMemory.locations[i - 1].long;
        }
        this.locationMemory.avgLatDiff = latDiffSum / 5;
        this.locationMemory.avgLongDiff = longDiffSum / 5;
      }

    } else {
      if ((now - this.locationMemory.time > 30000)) {
        this.locationMemory.locations = [];
        this.locationMemory.locations.push({
          lat: this.latitude,
          long: this.longitude,
        });
      } else {
        this.locationMemory.locations.push({
          lat: this.latitude,
          long: this.longitude,
        });
      }
    }
    this.locationMemory.time = now;
  }

  error = () => {}

  options = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10000,
    distanceFilter: 1
  };

  setModalVisible(desc?: string = '') {
    this.mounted && this.setState({modalVisible: !this.state.modalVisible});
    this.description = desc;
  }

  _setCameraTime() {
    if (!this.realm.objects('Timers')[0]) this._createNewTimerList();
    var timerSequence = this.realm.objects('TimerSequence')[0];
    var timeSince = new Date() - timerSequence.timeAccessedAt;
    if (timeSince >= 900000) { // Start a new timer group after every 15 minutes
      this.realm.write(() => {
         timerSequence.timeAccessedAt = new Date() / 1;
      });
      this._setTimerCount('increment');
      this._createNewTimerList();
      return;
    } else {
      // Start new timer after remaining milliseconds reach 15 minutes
      this.resetTimeLimit = setTimeout(this._setCameraTime.bind(this), 900000 - timeSince);
    }
    this._setTimerCount();
  }

  // Keep track of the length of the number of timers in each Timer list
  _setTimerCount(inc: string = '') {
    var timerSequence = this.realm.objects('TimerSequence')[0];
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

  takePicture() {

    this.pictureCount++;

    if (this.latitude && (this.locationMemory.locations.length < 5 || new Date() - this.locationMemory.time > 60000)) {
      navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
    } else if (this.latitude) {
      this.latitude += this.locationMemory.avgLatDiff;
      this.longitude += this.locationMemory.avgLongDiff;
      console.log('coords w/ diff', this.latitude, this.longitude, this.locationMemory.avgLatDiff, this.locationMemory.avgLongDiff);
    } else if (this.latitude === 0 && this.firstCapture) {
      navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
    }

    this.camera.capture()
    .then((data) => {
      if (this.firstCapture) { 
        // Delay the first capture in case savePicture attempts before 
        // components finish loading or location data has not been accessed yet.
        setTimeout(() => { 
          this._savePicture(data);
        }, 1200);
        this.firstCapture = false;
        return;
      }
      this._savePicture(data);
    })
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
    this.deleting = false;
  }

  _savePicture(data: object) {
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
        state: this.props.screenProps.profileState,
        mediaUri: data.mediaUri,
        mediaPath: data.path,
        description: this.description,
      });
    });
    this.description = '';
    this.license = '';
    // console.log('saved data:', this.realm.objects('Timers')[this.listIndex]['list'][this.realm.objects('Timers')[this.listIndex]['list'].length - 1]);
  }

  _setTimeLimit() {
    this.timeLimit = this.realm.objects('TimeLimit')[0].float;
  }

  _showNotification() {
    this.mounted && this.setState({newTimer: true});
    setTimeout(() => this.mounted && this.setState({newTimer: false}), 2000);
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
    }
  }
}

CameraApp.propTypes = { 
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: .8,
  },
  camera: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
