import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
//import ALPR from 'react-native-openalpr';
import Camera from 'react-native-camera';
import { unlink } from 'react-native-fs';
import Realm from 'realm';

import Navigation from '../navigation';
import SetTimeLimit from './SetTimeLimit';
import LocationInput from './LocationInput';
import Capture from './Capture';

export default class CameraApp extends Component {
  constructor() {
    super();
    this.state = {
      plate: '',
      modalVisible: false,
      newTimer: false,
    };
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

//  <ALPR
//  style={styles.imageRecognizer}
//  aspect={Camera.constants.Aspect.fill}
//  captureQuality={Camera.constants.CaptureQuality.medium}
//  country='us'
//  onPlateRecognized={(data) => this.onPlateRecognized(data)}
//  plateOutlineColor='#ff0000'
//  showPlateOutline
//  torchMode={Camera.constants.TorchMode.off}
//  touchToFocus
//  />


  render() {
    return (
      <View style={styles.container} >
        <LocationInput visibility={this.state.modalVisible} setModalVisible={this.setModalVisible.bind(this)} description={this.description}/>
        <Navigation navigation={this.props.navigation} />
        <SetTimeLimit onUpdateTimeLimit={this._onUpdateTimeLimit.bind(this)} newTimer={this.state.newTimer} realm={this.realm} />

        <View style={styles.cameraContainer} >

          <Camera
            ref={(cam) => this.camera = cam }
            style={styles.camera}
            aspect={Camera.constants.Aspect.fill}
          />
		      <Capture setModalVisible={this.setModalVisible.bind(this)} takePicture={this.takePicture.bind(this)} deletePreviousPicture={this.deletePreviousPicture.bind(this)} />
        </View>
      </View>
    );
}

  async componentWillMount() {
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

    navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
    this.setCameraTime();
    this._setTimeLimit();
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() { console.log('camera unmounts')
    this._mounted = false;
    clearTimeout(this._timeout);
  }

  onPlateRecognized({ plate, confidence }) {

    if (confidence > 0.9) {
      this.setState({
        plate,
      });
      console.log('plate recognized', this.state.plate, confidence);
    }
  }

  setModalVisible(desc?: string = '') {
    this._mounted && this.setState({modalVisible: !this.state.modalVisible});
    this.description = desc;
  }

  setTimerCount(inc: string = '') {
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
    if (this.locationService) { console.log('calling navigator')
      navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
    console.log('called navigator')
    }

    console.log('call camera')
    this.camera.capture()
      .then((data) => { console.log('then block')
        if (this.firstCapture) {     console.log('first capture')
          setTimeout(() => {     console.log('calling savePicture')
            this.savePicture(data);
          }, 1200);
          this.firstCapture = false;
          return;
        }
        this.savePicture(data);
      })
      .catch(err => console.error(err));
  }

  deletePreviousPicture(pictureCount?: number) {
    // TODO Updating most recent picture may delay the deletion order
    // removing previous data before the most recent picture has updated to realm.
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
        console.log('PICTURE REMOVED');
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
          timeLength: this.timeLimit, // TEST LENGTH TODO Build Time Length Adjuster/Setter
          license: this.state.plate ? this.state.plate : '',
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
          license: this.state.plate ? this.state.plate : '',
          VIN: '',
          mediaUri: data.mediaUri,
          mediaPath: data.path,
          description: this.description,
        });
      });
      this.description = "";
    }
  }

  _onUpdateTimeLimit(newLimit: number) {
    this.realm.write(() => {
      this.realm.objects('TimerSequence')[0].timeAccessedAt = new Date() / 1;
    });
    this.timeLimit = newLimit;
    this.setTimerCount('increment');
    this.createNewTimerList();
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
   imageRecognizer: {
     height: '80%',
     width: '100%',
   },
});
