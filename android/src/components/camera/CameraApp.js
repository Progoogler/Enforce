import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Image,
  Text
} from 'react-native';
import Camera from 'react-native-camera';
import MapView from 'react-native-maps';
import Realm from 'realm';

export class CameraApp extends Component {
  constructor() {
    super();
    this.latitude = null;
    this.longitude = null;
    this.cameraId = null;
    this.count = 1;
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
      <View style={styles.container}>
        <Button
          onPress={() => this.props.navigation.goBack()}
          title="Go back home"
        />
        <View style={styles.cameraContainer}>
          <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            style={styles.preview}
            aspect={Camera.constants.Aspect.fill}>
            <Text style={styles.capture} onPress={() => {
              this.takePicture();
              console.log(this.realm.objects('CameraTime'));
              console.log(this.realm.objects('Timers'));
              console.log(this.realm.objects('TimerCount'));
            }}>[CAPTURE]</Text>
          </Camera>
        </View>
      </View>
    );
  }

  componentWillMount() {
    let context = this;
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

  initializeTimers() {
    this.realm.write(() => {
      this.realm.create('Timers', {list1: [], list2: [], list3: [], list4: [], list5: [], list6: [], list7: [], list8: []});
    });
  }

  setTimerCount(inc = '') {
    let countObj = this.realm.objects('TimerCount')[0];
    if (inc) {
      let currentCount = countObj.count;
      this.realm.write(() => {
        currentObj.count = currentCount + 1
      });
      this.count = currentCount + 1;
      return;
    }

    if (countObj === undefined) {
      this.realm.write(() => {
        this.realm.create('TimerCount', {count: 1});
      });
    } else {
      this.count = countObj.count;
    }
  }

  setCameraTime() {
    let cameraTime = this.realm.objects('CameraTime')[0];
    if (cameraTime === undefined) {
      this.initializeTimers();
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
        this.setTimerCount('increment');
      } else {
        setTimeout(this.setCameraTime.bind(this), (900 - timeSince) * 1000);
      }
    }
  }

  takePicture() {
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

  savePicture(data) {
    const Timers = this.realm.objects('Timers')[0];
    switch(this.count) {
      case 1:
        this.realm.write(() => {
          Timers.list1.push({
            latitude: this.latitude,
            longitude: this.longitude,
            createdAt: new Date() / 1000,
            createdAtDate: new Date(),
            mediaUri: data.mediaUri,
            mediaPath: data.path,
          });
        });
        break;
      case 2:
        this.realm.write(() => {
          Timers.list2.push({
            latitude: this.latitude,
            longitude: this.longitude,
            createdAt: new Date() / 1000,
            createdAtDate: new Date(),
            mediaUri: data.mediaUri,
            mediaPath: data.path,
          });
        });
        break;
      case 3:
        this.realm.write(() => {
          Timers.list3.push({
            latitude: this.latitude,
            longitude: this.longitude,
            createdAt: new Date() / 1000,
            createdAtDate: new Date(),
            mediaUri: data.mediaUri,
            mediaPath: data.path,
          });
        });
        break;
      case 4:
        this.realm.write(() => {
          Timers.list4.push({
            latitude: this.latitude,
            longitude: this.longitude,
            createdAt: new Date() / 1000,
            createdAtDate: new Date(),
            mediaUri: data.mediaUri,
            mediaPath: data.path,
          });
        });
        break;
        case 5:
          this.realm.write(() => {
            Timers.list5.push({
              latitude: this.latitude,
              longitude: this.longitude,
              createdAt: new Date() / 1000,
              createdAtDate: new Date(),
              mediaUri: data.mediaUri,
              mediaPath: data.path,
            });
          });
          break;
        case 6:
          this.realm.write(() => {
            Timers.list6.push({
              latitude: this.latitude,
              longitude: this.longitude,
              createdAt: new Date() / 1000,
              createdAtDate: new Date(),
              mediaUri: data.mediaUri,
              mediaPath: data.path,
            });
          });
          break;
        case 7:
          this.realm.write(() => {
            Timers.list17.push({
              latitude: this.latitude,
              longitude: this.longitude,
              createdAt: new Date() / 1000,
              createdAtDate: new Date(),
              mediaUri: data.mediaUri,
              mediaPath: data.path,
            });
          });
          break;
        case 8:
          this.realm.write(() => {
            Timers.list8.push({
              latitude: this.latitude,
              longitude: this.longitude,
              createdAt: new Date() / 1000,
              createdAtDate: new Date(),
              mediaUri: data.mediaUri,
              mediaPath: data.path,
            });
          });
          break;
      default:
        console.error('Failed to update timer to list.')
        break;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});
