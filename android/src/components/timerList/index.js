import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import PropTypes from 'prop-types';
import Realm from 'realm';

import coordinatesBound from './coordinatesBound';
import { setUserTickets, setTicketImage } from '../../../../includes/firebase/database';
import Done from './Done';
import Row from './Row';
import Search from '../search';
import Title from './Title';
import Warning from './Warning';
import { timerFlatListHeight } from '../../styles/common';

import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob; // Initialize Blob for converting images into binary
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

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
      bound: undefined,
      dataSource: this.list,
      license: '',
      modalVisible: false,
      refreshing: false,
      warningVisibility: false,
    };
    this.currentLicense = 0;
    this.license = '';
    this.mounted = false;
    this.reset = false;
    this.ticketCount = undefined;
    this.timeElapsed = '';
    this.timeoutRefresh = null;
    this.timer = null;
    this.VIN = '';

    // These variables are used to calculate the index of the Timer currently in the scroll view
    this.flatListHeight = Math.ceil(timerFlatListHeight);
    this.halvedFlatListHeight = Math.ceil(timerFlatListHeight / 2);
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
        <Search
          addLicenseToQueue={this.addLicenseToQueue.bind(this)}
          licenseParam={this.state.license}
          navigation={this.props.navigation}
          refPath={this.props.screenProps.refPath}
          refreshTimerList={this.onRefresh.bind(this)}
          shouldResetLicense={this.shouldResetLicense.bind(this)}
          timerList={true}
        />

        <Title 
          bound={this.state.bound} 
          getDirectionBound={this.getDirectionBound.bind(this)}
          limit={this.list[0] ? this.list[0].timeLength ? this.list[0].timeLength : 0 : 0} 
        />

        <FlatList
           data={this.state.dataSource}
           ItemSeparatorComponent={this._renderSeparator}
           keyExtractor={this._keyExtractor}
           onRefresh={this.onRefresh.bind(this)}
           onScroll={this._handleScroll.bind(this)}
           refreshing={this.state.refreshing}
           removeClippedSubviews={true}
           renderItem={this._renderItem.bind(this)}
        />

        <Warning 
          clearWarning={this.updateRows.bind(this)}
          timeElapsed={this.timeElapsed} 
          uponTicketed={this.uponTicketed.bind(this)} 
          visibility={this.state.warningVisibility} 
        />
        
        { this.state.modalVisible ? <Done navigation={this.props.navigation}/> : null }

      </View>
    );
  }

  componentDidMount() {
    this.mounted = true;
    if (this.list[0].createdAt === 0 || Object.keys(this.list).length === 0) {
      this.setState({ modalVisible: true });
    } else {
      this.enterLicenseInSearchField({
        license: this.list[0].license,
        listIndex: 0,
      });
    }
    if (this.list[0].latitude) this.getDirectionBound();
    this._prepareTimeout();
    this.ticketCount = this.realm.objects('Ticketed')[0]['list'].length;
  }

  componentWillUnmount() {
    if (this.props.screenProps.dataUpload && this.props.screenProps.refPath && this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length) {
      var date = new Date();
      date = `${date.getMonth() + 1}-${date.getDate()}`;
      var ticketedImage = {};
      for (let i = this.ticketCount; i < this.realm.objects('Ticketed')[0]['list'].length; i++) {
        ticketedImage[this.realm.objects('Ticketed')[0]['list'][i].license ?
         this.realm.objects('Ticketed')[0]['list'][i].license :
          this.realm.objects('Ticketed')[0]['list'][i].createdAt] =
           this.realm.objects('Ticketed')[0]['list'][i];
      }
      setUserTickets(`/${this.props.screenProps.refPath}/${date}`, ticketedImage);
    }
    this.props.navigation.state.params = undefined; // Reset params so constructor finds earliest ending Timer upon opening from Navigation menu
    clearTimeout(this.timeoutRefresh);
    this.mounted = false;
  }

  _prepareTimeout() {
    var now = new Date();
    for (let i = 0; i < this.list.length; i++) {
      if (now - this.list[i].createdAt < this.list[i].timeLength * 60 * 60 * 1000) {
        this.timeoutRefresh = setTimeout(() => {
          this.onRefresh();
          this._prepareTimeout();
        }, this.list[i].timeLength * 60 * 60 * 1000 - (now - this.list[i].createdAt));
        return;
      }
    }
    clearTimeout(this.timeoutRefresh);
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
    this.setState({
      refreshing: true,
      dataSource: this.list,
    });
    setTimeout(() => { this.mounted && this.setState({refreshing: false})}, 1500);
  }

  updateRows(clearWarning: string, only?: string): undefined {
    if (this.list.length === 0 && clearWarning) {
      this.mounted && this.setState({
        dataSource: this.list,
        modalVisible: true, // Show the "Done" button to indicate end of list.
        warningVisibility: false,
      });
    } else if (this.list.length === 0) {
      this.mounted && this.setState({
        modalVisible: true,
      });
    } else if (clearWarning && only) { // Extra transaction handler for displaying the warning sign.
      this.mounted && this.setState({
        warningVisibility: false,
      });
    } else if (clearWarning) {
      this.mounted && this.setState({
        dataSource: this.list,
        warningVisibility: false,
      });
    } else {
      this.mounted && this.setState({
        dataSource: this.list,
      });
    }
  }

  uponTicketed(timer: object, force?: string): undefined { // Handle updates to Realm for regular and forced
    if (Array.isArray(timer)) {
      timer = this.timer;
      this.timer = null;
    }
    var now = new Date();
    var indexOfTimer; // Keep track of the index so that the next timer's license can be inserted into the search field
    if (now - timer.createdAt >= timer.timeLength * 60 * 60 * 1000 || force) {
      if (this.list['0'].createdAt === timer.createdAt) {
        // Ticket the first timer in the list
        indexOfTimer = 0;
        this.realm.write(() => {
          timer.ticketedAt = now / 1; // Divide new Date() by 1 to get an integer to satisfy the Realm type.
          // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
          if (this.license) timer.license = this.license;
          timer.VIN = this.VIN;
          this.realm.objects('Ticketed')[0]['list'].push(timer);
          this.list.shift();
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
            timer.ticketedAt = now / 1;
            // Update license from search input field only if license doesn't already exist and it wasn't passed via enterLicenseInSearchField()
            if (this.license) timer.license = this.license;
            timer.VIN = this.VIN;
            this.realm.objects('Ticketed')[0]['list'].push(timer);
            this.list.splice(parseInt(indexOfTimer), 1);
          });
        }
      }
      if (this.license) this.resetLicenseAndVIN();
      if (this.props.screenProps.imageUpload && this.props.screenProps.refPath) { // Uploads the image to the user's Firebase account
        let rnfbURI = RNFetchBlob.wrap(timer.mediaPath);
        Blob
          .build(rnfbURI, {type: 'image/jpg;'})
          .then((blob) => {
            let month = now.getMonth() + 1;
            let day = now.getDate();
            // setTicketImage(refPath, imagePath, blob);
            setTicketImage(`${this.props.screenProps.refPath}/${month}-${day}`, `${timer.createdAt}`, blob);
          });
      }
      this.updateRows('clearWarning');
    } else {
      this.timer = timer;
      let timeElapsed = (now - timer.createdAt) / 1000 / 60;
      this.timeElapsed = `${(timeElapsed / 60 + '')[0] !== '0' ? (timeElapsed / 60 + '')[0] + ' hour' : ''} ${Math.floor(timeElapsed % 60)} minutes`;
      this.mounted && this.setState({
        warningVisibility: true,
      });
    }
    if (indexOfTimer !== undefined && this.list[indexOfTimer] !== undefined) {
      // Handles updating license input field for the last timer that is not also the first
      this.enterLicenseInSearchField({
        license: this.list[indexOfTimer].license, // The current indexOfTimer here has replaced the previous one
        listIndex: this.list[indexOfTimer].index,
      });
    }
  }

  async expiredFunc(timer: object): undefined {
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
    if (this.license) this.resetLicenseAndVIN();
    this.updateRows();
    if (indexOfTimer !== undefined && this.list[indexOfTimer] !== undefined) {
      this.enterLicenseInSearchField({
        license: this.list[indexOfTimer].license, // The current indexOfTimer here has replaced the previous one
        listIndex: this.list[indexOfTimer].index,
      });
    }
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

    this.updateRows();
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

  _renderItem(data: object): object {
    return (
      <Row
        data={data.item}
        expiredFunc={this.expiredFunc.bind(this)}
        uponTicketed={this.uponTicketed.bind(this)}
        enterLicenseInSearchField={this.enterLicenseInSearchField.bind(this)}
        navigation={this.props.navigation}
      />
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
    if (event.nativeEvent.contentOffset.y > this.halvedFlatListHeight) {
      let idx = Math.ceil(event.nativeEvent.contentOffset.y / this.flatListHeight);
      if (idx !== this.currentLicense) {
        if (this.list[idx] === undefined) return;
        this.currentLicense = idx;
        this.enterLicenseInSearchField({
          license: this.list[idx].license,
          listIndex: this.list[idx].index,
        });
      }
    } else {
      this.currentLicense = 0;
      this.enterLicenseInSearchField({
        license: this.list[0].license,
        listIndex: this.list[0].index,
      });
    }
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
  separator: {
    backgroundColor: '#8E8E8E',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
