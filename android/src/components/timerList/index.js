import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Realm from 'realm';

import coordinatesBound from './coordinatesBound';
import { setUserTicket, setTicketImage } from '../../../../includes/firebase/database';
import TimersImageList from './TimerImageList';
import Done from './Done';
import Search from '../search';
import Title from './Title';
import Warning from './Warning';

import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob; // Initialize Blob for converting images into binary
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

/* global require */
export default class TimerList extends Component {
  constructor(props) {
    super(props);
    this.addLicenseToQueue = this.addLicenseToQueue.bind(this);
    this.enterLicenseInSearchField = this.enterLicenseInSearchField.bind(this);
    this.expiredFunc = this.expiredFunc.bind(this);
    this.getDirectionBound = this.getDirectionBound.bind(this);
    this.imageUploads = {};
    this.license = '';
    this.mounted = false;
    this.onRefresh = this.onRefresh.bind(this);
    this.reset = false;
    this.shouldResetLicense = this.shouldResetLicense.bind(this);
    this.ticketCount = undefined;
    this.timeElapsed = '';
    this.timeoutRefresh = null;
    this.timer = null;
    this.updateRows = this.updateRows.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.uponTicketed = this.uponTicketed.bind(this);
    this.VIN = '';

    this.realm = new Realm();
    if (!this.props.navigation.state.params) {
      this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
      this.list = this.list.length > 0 ? this.list[0].list : [{'createdAt': 0}];
    } else {
      this.list = this.props.navigation.state.params.timers !== undefined ? this.realm.objects('Timers')[this.props.navigation.state.params.timers].list : [{'createdAt': 0}];
    }
    this.state = {
      bound: undefined,
      dataSource: this.list,
      done: false,
      license: '',
      refreshing: false,
      reset: 0,
      upload: true,
      warning: false,
    };
  }

  static navigationOptions = {
    drawerLabel: 'Timers',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/clock-icon.png')}/>
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Warning 
          clearWarning={this.updateRows}
          timeElapsed={this.timeElapsed} 
          uponTicketed={this.uponTicketed} 
          visibility={this.state.warning} 
        />

        <Search
          addLicenseToQueue={this.addLicenseToQueue}
          licenseParam={this.state.license}
          navigation={this.props.navigation}
          refPath={this.props.screenProps.refPath}
          refreshTimerList={this.onRefresh}
          shouldResetLicense={this.shouldResetLicense}
          timerList={true}
        />

        <Title 
          bound={this.state.bound} 
          getDirectionBound={this.getDirectionBound}
          limit={this.list[0] ? this.list[0].timeLength ? this.list[0].timeLength : 0 : 0} 
        />

        <TimersImageList
          data={this.state.dataSource}
          dataUpload={this.props.screenProps.dataUpload}
          enterLicenseInSearchField={this.enterLicenseInSearchField}
          expiredFunc={this.expiredFunc}
          imageRecognition={this.props.screenProps.imageRecognition}
          navigation={this.props.navigation}
          onRefresh={this.onRefresh}
          uploadImage={this.uploadImage}
          uponTicketed={this.uponTicketed}
          refreshing={this.state.refreshing}
          reset={this.state.reset}
        />
        
        { this.state.done ? <Done navigation={this.props.navigation}/> : null }

      </View>
    );
  }

  componentDidMount() {
    this.mounted = true;
    if (this.list[0].createdAt === 0 || Object.keys(this.list).length === 0) {
      this.setState({ done: true });
    } else {
      this.enterLicenseInSearchField({
        license: this.list[0].license,
        listIndex: 0,
      });
    }
    if (this.list[0].latitude) this.getDirectionBound();
    this._setTimeoutRefresh();
    this.ticketCount = this.realm.objects('Ticketed')[0]['list'].length;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.license.license !== nextState.license.license) return false; // TODO Check whether this updates Search..
    return true;
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutRefresh);
    var date;
    if (this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length && this.state.upload && this.props.screenProps.dataUpload && this.props.screenProps.refPath) {
      date = new Date();
      date = `${date.getMonth() + 1}-${date.getDate()}`;
      for (let i = this.ticketCount; i < this.realm.objects('Ticketed')[0]['list'].length; i++) {
        let key = this.realm.objects('Ticketed')[0]['list'][i].license ?
          this.realm.objects('Ticketed')[0]['list'][i].license :
          this.realm.objects('Ticketed')[0]['list'][i].createdAt + '';
        setUserTicket(`/${this.props.screenProps.refPath}/${date}`, key, this.realm.objects('Ticketed')[0]['list'][i]);
      }
    } else if (this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length && this.state.upload && !this.props.screenProps.dataUpload && this.props.screenProps.refPath && Object.keys(this.imageUploads).length) {
      date = new Date();
      date = `${date.getMonth() + 1}-${date.getDate()}`;
      for (let i = this.ticketCount; i < this.realm.objects('Ticketed')[0]['list'].length; i++) {
        if (this.imageUploads[this.realm.objects('Ticketed')[0]['list'][i].createdAt]) {
          let key = this.realm.objects('Ticketed')[0]['list'][i].license ?
            this.realm.objects('Ticketed')[0]['list'][i].license :
            this.realm.objects('Ticketed')[0]['list'][i].createdAt + '';
          setUserTicket(`/${this.props.screenProps.refPath}/${date}`, key, this.realm.objects('Ticketed')[0]['list'][i]);
        }
      }
    }
    this.props.navigation.state.params = undefined; // Reset params so constructor finds earliest ending Timer upon opening from Navigation menu  
    this.mounted = false;
  }

  _setTimeoutRefresh() {
    var now = new Date();
    clearTimeout(this.timeoutRefresh);
    for (let i = 0; i < this.list.length; i++) {
      if (now - this.list[i].createdAt < this.list[i].timeLength * 60 * 60 * 1000) {
        this.timeoutRefresh = setTimeout(() => {
          this.onRefresh();
          this._setTimeoutRefresh();
        }, this.list[i].timeLength * 60 * 60 * 1000 - (now - this.list[i].createdAt));
        return;
      }
    }
  }

  getDirectionBound() {
    if (!this.list[0].latitude) return;
    var avgLat = 0;
    var avgLong = 0;
    for (let i = 1; i < Math.min(6, this.list.length); i++) {
      avgLat += this.list[i].latitude;
      avgLong += this.list[i].longitude;
    }
    avgLat = avgLat / Math.min(5, this.list.length - 1);
    avgLong = avgLong / Math.min(5, this.list.length - 1);
    var bound = coordinatesBound(this.list[0].latitude, this.list[0].longitude, avgLat, avgLong);
    this.mounted && this.setState({bound});
    setTimeout(() => this.mounted && this.setState({bound: undefined}), 5000);
  }

  onRefresh() {
    if (this.props.screenProps.dataUpload && !this.state.upload) this.decipherUploadSetting();
    this.setState({
      refreshing: true,
      dataSource: this.list,
    });
    setTimeout(() => { this.mounted && this.setState({refreshing: false})}, 1500);
  }

  updateRows(clearWarning: string, only?: string): undefined {
    if (this.list.length === 0 && clearWarning) {
      this.mounted && this.setState({
        done: true, // Show the "Done" button to indicate end of list.
        reset: this.state.reset + 1,
        warning: false,
      });
    } else if (this.list.length === 0) {
      this.mounted && this.setState({
        done: true,
      });
    } else if (clearWarning && only) { // Extra transaction handler for displaying the warning sign.
      this.mounted && this.setState({ 
        warning: false,
      });
    } else if (clearWarning) {
      this.mounted && this.setState({
        reset: this.state.reset + 1,
        warning: false,
      });
    }
  }

  uponTicketed(timer: object, force?: string, cb?: func): undefined { // Handle updates to Realm for regular and forced
    if (Array.isArray(timer)) {
      timer = this.timer;
      this.timer = null;
    }
    var now = Date.now();
    var indexOfTimer; // Keep track of the index so that the next timer's license can be inserted into the search field
    if (this.imageUploads[timer.createdAt]) var imageUpload = true;
    if (now - timer.createdAt >= timer.timeLength * 60 * 60 * 1000 || force) {
      if (cb) cb();
      if (this.list['0'].createdAt === timer.createdAt) {
        // Ticket the first timer in the list
        indexOfTimer = 0;
        this.realm.write(() => {
          timer.ticketedAt = now; 
          // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
          if (this.license) timer.license = this.license;
          timer.VIN = this.VIN;
          this.realm.objects('Ticketed')[0]['list'].push(timer);
          this.list.shift(); // !!Not pure!! Configuring this list affects this.state.dataSource & realm object directly!
        });
      } else {
        for (let index in this.list) {
          // Search for the index of the timer which was selected
          if (this.list[index].createdAt === timer.createdAt) {
            indexOfTimer = index;
            break;
          }
        }
        if (indexOfTimer) {
          this.realm.write(() => {
            timer.ticketedAt = now;
            // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
            if (this.license) timer.license = this.license;
            timer.VIN = this.VIN;
            this.realm.objects('Ticketed')[0]['list'].push(timer);
            this.list.splice(parseInt(indexOfTimer), 1);
          });
        }
      }
      if (this.license) this.resetLicenseAndVIN();
      if ((this.props.screenProps.imageUpload && this.props.screenProps.refPath) || imageUpload) { // Uploads the image to the user's Firebase account
        let rnfbURI = RNFetchBlob.wrap(timer.mediaPath);
        Blob
        .build(rnfbURI, {type: 'image/jpg;'})
        .then((blob) => {
          let month = new Date().getMonth() + 1;
          let day = new Date().getDate();
          // setTicketImage(refPath, imagePath, blob);
          setTicketImage(`${this.props.screenProps.refPath}/${month}-${day}`, `${timer.createdAt}`, blob);
        });
      }
      if (this.state.warning) {
        this.updateRows('clearWarning');
      } else {
        this.updateRows();
      }

      this._setTimeoutRefresh();
    } else {
      this.timer = timer;
      let timeElapsed = (now - timer.createdAt) / 1000 / 60;
      this.timeElapsed = `${(timeElapsed / 60 + '')[0] !== '0' ? (timeElapsed / 60 + '')[0] + ' hour' : ''} ${Math.floor(timeElapsed % 60)} minutes`;
      this.mounted && this.setState({warning: true});
    }
    if (indexOfTimer !== undefined && this.list[indexOfTimer] !== undefined) {
      // Handles updating license input field for the last timer that is not also the first
      this.enterLicenseInSearchField({
        license: this.list[indexOfTimer].license, // The current indexOfTimer here has replaced the previous one
        listIndex: this.list[indexOfTimer].index,
      });
    }
  }

  expiredFunc(timer: object): undefined {
    var indexOfTimer;
    if (this.list['0'] === timer) {
      indexOfTimer = 0;
      this.realm.write(() => {
        // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
        if (this.license) timer.license = this.license;
        timer.ticketedAt = new Date() / 1; // Store the date for the "Expired" data field in history retrieval.
        this.realm.objects('Expired')[0]['list'].push(timer);
        this.list.shift();
      });
    } else {
      for (let index in this.list) {
        if (this.list[index].createdAt === timer.createdAt) {
          indexOfTimer = index;
          break;
        }
      }
      if (indexOfTimer) {
        this.realm.write(() => {
          // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
          if (this.license) timer.license = this.license;
          timer.ticketedAt = new Date() / 1;
          this.realm.objects('Expired')[0]['list'].push(timer);
          this.list.splice(parseInt(indexOfTimer), 1);
        });
      }
    }
    if (this.list.length === 0) {
      this.updateRows();
      return;
    }
    if (this.license) this.resetLicenseAndVIN();
    if (indexOfTimer !== undefined && this.list[indexOfTimer] !== undefined) {
      this.enterLicenseInSearchField({
        license: this.list[indexOfTimer].license, // The current indexOfTimer here has replaced the previous one
        listIndex: this.list[indexOfTimer].index,
      });
    }
    this._setTimeoutRefresh();
  }

  enterLicenseInSearchField(license: object) {
    this.setState({license});
    if (this.license) this.license = ''; // Reset value when user scrolls to another picture
  }

  addLicenseToQueue(license: string) {
    this.license = license;

    // TODO
    // call fetch to AutoCheck
    // return VIN
    // this.vin = VIN
    //<VinSearch handleVINSearch={this.handleVINSearch.bind(this)}/>

    // this.updateRows();
  }

  shouldResetLicense(setToFalse: boolean) {
    if (setToFalse) {
      this.reset = false;
      return;
    }
    return this.reset;
  }

  resetLicenseAndVIN() {
    this.reset = true;
    this.license = '';
    this.VIN = '';
  }

  uploadImage(createdAt: number, bool: boolean) {
    this.imageUploads[createdAt] = bool;
  }

}

TimerList.propTypes = {
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
});
