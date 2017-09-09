import React, { Component } from 'react';
import {
  View,
  Image,
  StatusBar,
  StyleSheet,
  AsyncStorage,
} from 'react-native';
import PropTypes from 'prop-types';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import Realm from 'realm';
import { setUserTickets, setTicketImage } from '../../../../includes/firebase/database';
import coordinatesBound from './coordinatesBound';

import Title from './Title';
import Row from './Row';
import Search from '../search';
import Warning from './Warning';
import Done from './Done';
import { timerRowImageHeight, timerFlatListHeight } from '../../styles/common';

import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob; // Initialize Blob for converting images into binary
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

var imageHeight = timerRowImageHeight - (StatusBar.currentHeight ? StatusBar.currentHeight : 0);

/* global require */
export default class TimerList extends Component {
  constructor(props) {
    super(props);
    this.realm = new Realm();
    if (!this.props.navigation.state.params) {
      this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
      this.list = this.list.length > 0 ? this.list[0].list : [{'createdAt': 0}];
    } else {
      this.list = this.props.navigation.state.params.timers !== undefined ? this.realm.objects('Timers')[this.props.navigation.state.params.timers].list : [{'createdAt': 0}];
    }
    this.state = {
      dataSource: this.list,
      refreshing: false,
      warningVisibility: false,
      modalVisible: false,
      license: '',
      bound: undefined,
    };
    this.timer = null;
    this.VIN = '';
    this.license = '';
    this.timeElapsed = '';
    this._reset = false;
    this.licenseList = [];
    this.ticketCount = undefined;
    this._currentLicense = 0;

    // These variables are used to calculate the index of the Timer currently in the scroll view
    this._flatListHeight = Math.ceil(timerFlatListHeight);
    this._halvedFlatListHeight = Math.ceil(timerFlatListHeight / 2);
  }

  static navigationOptions = {
    drawerLabel: 'Timers',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/clock-icon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {

    return (
      <View style={styles.container}>
        <Search
          timerList={true}
          realm={this.realm}
          refreshTimerList={this.onRefresh.bind(this)}
          navigation={this.props.navigation}
          licenseParam={this.state.license}
          shouldResetLicense={this.shouldResetLicense.bind(this)}
          addLicenseToQueue={this.addLicenseToQueue.bind(this)} />

        <Title limit={this.list[0] ? this.list[0].timeLength ? this.list[0].timeLength : 0 : 0} bound={this.state.bound} getDirectionBound={this.getDirectionBound.bind(this)}/>

        <Warning timeElapsed={this.timeElapsed} visibility={this.state.warningVisibility} uponTicketed={this.uponTicketed.bind(this)} clearWarning={this.updateRows.bind(this)}/>

        <FlatList
           data={this.state.dataSource}
           ItemSeparatorComponent={this._renderSeparator}
           renderItem={this._renderItem.bind(this)}
           onRefresh={this.onRefresh.bind(this)}
           refreshing={this.state.refreshing}
           keyExtractor={this._keyExtractor}
           onScroll={this._handleScroll.bind(this)}
           />

        { this.state.modalVisible ? <Done navigation={this.props.navigation} /> : <View /> }

      </View>
    );
  }

  componentWillMount() {
    this.ticketCount = this.realm.objects('Ticketed')[0]['list'].length;
  }

  componentWillUnmount() {
    if (this.settings.dataUpload && this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length) {
      setUserTickets(this.refPath, this.realm.objects('Ticketed')[0]['list']);
    }
    this.props.navigation.state.params = undefined; // TODO check if resetting this is really necessary
    this._mounted = false;
  }

  componentDidMount() {
    this._mounted = true;
    if (this.list[0].createdAt === 0) {
      this.setState({ modalVisible: true });
    } else {
      // Keep a local array of licenses to update the search input field as FlatList scrolls
      for (let i = 0; i < this.list.length; i++) {
        this.licenseList.push(this.list[i].license);
      }
      this.enterLicenseInSearchField({
        license: this.licenseList[0],
        pressed: 0,
        listIndex: 0,
      });
    }
    if (this.list[0].latitude) this.getDirectionBound();
    this._getUserInfo();
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
    this._mounted && this.setState({bound});
    setTimeout(() => this._mounted && this.setState({bound: undefined}), 5000);
  }

  async _getUserInfo() {
    this.settings = await AsyncStorage.getItem('@Enforce:settings');
    this.settings = JSON.parse(this.settings);
    this.refPath = await AsyncStorage.getItem('@Enforce:refPath');
    this.updateRows();
  }

  onRefresh() {
    this.setState({
      refreshing: true,
      dataSource: this.list,
    });
    setTimeout(() => { this._mounted && this.setState({refreshing: false})}, 1500);
  }

  updateRows(clearWarning: string, only?: string): undefined {
    if (this.list.length === 0 && clearWarning) {
      this._mounted && this.setState({
        dataSource: this.list,
        modalVisible: true, // Show the "Done" button to indicate end of list.
        warningVisibility: false,
      });
    } else if (this.list.length === 0) {
      this._mounted && this.setState({
        modalVisible: true,
      });
    } else if (clearWarning && only) { // Extra transaction handler for displaying the warning sign.
      this._mounted && this.setState({
        warningVisibility: false,
      });
    } else if (clearWarning) {
      this._mounted && this.setState({
        dataSource: this.list,
        warningVisibility: false,
      });
    } else {
      this._mounted && this.setState({
        dataSource: this.list,
      });
    }
  }

  async uponTicketed(timer: object, force?: string): undefined { // Handle updates to Realm for regular and forced.
    if (Array.isArray(timer)) timer = this._timer;
    let now = new Date();
    let indexOfTimer;
    if (now - timer.createdAt >= timer.timeLength * 60 * 60 * 1000 || force) {
      let timers = this.realm.objects('Timers')[timer.index]['list'];
      if (timers['0'].createdAt === timer.createdAt) {
        // Ticket the first timer in the list
        indexOfTimer = 0;
        this.licenseList.shift();
        await this.realm.write(() => {
          timer.ticketedAt = now / 1;
          // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
          if (this.license) timer.license = this.license;
          timer.VIN = this.VIN;
          this.realm.objects('Ticketed')[0]['list'].push(timer);
          timers.shift();
        });
      } else {
        for (let index in timers) {
          // Search for the index of the timer which was selected
          if (timers[index].createdAt === timer.createdAt) {
            indexOfTimer = index;
            break;
          }
        }
        if (indexOfTimer) {
          this.licenseList.splice(indexOfTimer, 1);
          await this.realm.write(() => {
            timer.ticketedAt = new Date() / 1;
            // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
            if (this.license) timer.license = this.license;
            timer.VIN = this.VIN;
            this.realm.objects('Ticketed')[0]['list'].push(timer);
            timers.splice(parseInt(indexOfTimer), 1);
          });
        }
      }
      if (this.license) this.resetLicenseAndVIN();
      if (this.settings.imageUpload) { // Uploads the image to the user's Firebase account
        let rnfbURI = RNFetchBlob.wrap(timer.mediaPath);
        Blob
          .build(rnfbURI, {type: 'image/jpg;'})
          .then((blob) => {
            let month = now.getMonth() + 1;
            let day = now.getDate();
            let refPath = `${this.refPath}/${month}-${day}`;
            let imagePath = `${timer.createdAt}`;
            setTicketImage(refPath, imagePath, blob);
          });
      }
      this.updateRows('clearWarning');
    } else {
      this._timer = timer;
      let timeElapsed = (new Date() - timer.createdAt) / 1000 / 60;
      this.timeElapsed = `${(timeElapsed / 60 + '')[0] !== '0' ? (timeElapsed / 60 + '')[0] + ' hour' : ''} ${Math.floor(timeElapsed % 60)} minutes`;
      this._mounted && this.setState({
        warningVisibility: true,
      });
    }
    if (indexOfTimer !== undefined && this.list[indexOfTimer] !== undefined) {
      // Handles updating license input field for the last timer that is not also the first
      this.enterLicenseInSearchField({
        license: this.licenseList[indexOfTimer], // The current indexOfTimer here has replaced the previous one
        pressed: 0,
        listIndex: this.list[indexOfTimer].index,
      });
    }
  }

  async expiredFunc(timer: object): undefined {
    let timers = this.realm.objects('Timers')[timer.index]['list'];
    let indexOfTimer;
    if (timers['0'] === timer) {
      indexOfTimer = 0;
      this.licenseList.shift();
      await this.realm.write(() => {
        // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
        if (this.license) timer.license = this.license;
        this.realm.objects('Expired')[0]['list'].push(timer);
        timers.shift();
      });
    } else {
      for (let index in timers) {
        if (timers[index].createdAt === timer.createdAt) {
          indexOfTimer = index;
          break;
        }
      }
      if (indexOfTimer) {
        this.licenseList.splice(indexOfTimer, 1);
        await this.realm.write(() => {
          // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
          if (this.license) timer.license = this.license;
          this.realm.objects('Expired')[0]['list'].push(timer);
          timers.splice(parseInt(indexOfTimer), 1);
        });
      }
    }
    if (this.license) this.resetLicenseAndVIN();
    this.updateRows();
    if (indexOfTimer !== undefined && this.list[indexOfTimer] !== undefined) {
      this.enterLicenseInSearchField({
        license: this.licenseList[indexOfTimer], // The current indexOfTimer here has replaced the previous one
        pressed: 0,
        listIndex: this.list[indexOfTimer].index,
      });
    }
  }

  // checkUpdatedLicenseValidity(originalLicense: string, updatedLicense: string): string {
  //   var validity = 0;
  //   for (var i = 0; i < originalLicense.length; i++) {
  //     let check = updatedLicense.includes(originalLicense[i]);
  //     if (check) validity++;
  //   }
  //   return validity > 1 ? updatedLicense : originalLicense;
  // }

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

    this.updateRows();
  }

  shouldResetLicense(setToFalse: boolean) {
    if (setToFalse) {
      this._reset = false;
      return;
    }
    return this._reset;
  }

  resetLicenseAndVIN() {
    this._reset = true;
    this.license = '';
    this.VIN = '';
  }

  _renderItem(data: object): object {
    return (
      <Row
        data={data.item}
        imageHeight={imageHeight}
        expiredFunc={this.expiredFunc.bind(this)}
        uponTicketed={this.uponTicketed.bind(this)}
        enterLicenseInSearchField={this.enterLicenseInSearchField.bind(this)} />
    );
  }

  _renderSeparator() {
    return <View style={styles.separator} />;
  }

  _keyExtractor(item: object = {'createdAt': 0}): number {
    return item.createdAt;
  }

  _handleScroll(event) {
    // Update the license value of the current timer on the FlatList view to the search input field as user scrolls
    if (event.nativeEvent.contentOffset.y > this._halvedFlatListHeight) {
      let idx = Math.ceil(event.nativeEvent.contentOffset.y / this._flatListHeight);
      if (idx !== this._currentLicense) {
        if (this.licenseList[idx] === undefined) return;
        this._currentLicense = idx;
        this.enterLicenseInSearchField({
          license: this.licenseList[idx],
          pressed: 0,
          listIndex: this.list[idx].index,
        });
      }
    } else {
      this._currentLicense = 0;
      this.enterLicenseInSearchField({
        license: this.licenseList[0],
        pressed: 0,
        listIndex: this.list[0].index,
      });
    }
  }

}

TimerList.propTypes = {
  navigation: PropTypes.object.isRequired,

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});
