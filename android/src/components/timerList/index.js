import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  RefreshControl,
  AsyncStorage,
  Keyboard,
} from 'react-native';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import Realm from 'realm';
import { setUserTickets, setTicketImage } from '../../../../includes/firebase/database';
import insertionSortModified from '../overview/insertionSort';

import Title from './Title';
import Row from './Row';
import Footer from './Footer';
import Search from '../search';
import Warning from './Warning';
import Done from './Done';

import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob; // Initialize Blob for converting images into binary
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;


export default class TimerList extends Component {
  constructor(props) {
    super(props);
    this.realm = new Realm();
    if (!this.props.navigation.state.params) {
      this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
      this.list = this.list.length > 0 ? this.list[0].list : [{list: [{'createdAt': 0}]}];
      this.props.navigation.state.params = {};
      this.props.navigation.state.params.timers = this.list;
    } else {
      this.list = this.props.navigation.state.params.timers ? this.props.navigation.state.params.timers : [{list: [{'createdAt': 0}]}];
    }
    this.state = {
      dataSource: this.list,
      refreshing: false,
      warningVisibility: false,
      modalVisible: false,
    };
    this.timer = null;
    this.ticketedCount = 0;
    this.VIN = "3999"; //TODO REMOVE
    this.license = '';
    this.timeElapsed = '';
    this._reset = false;
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
        <Search navigation={this.props.navigation} timerList={true} shouldResetLicense={this.shouldResetLicense.bind(this)} addLicenseToQueue={this.addLicenseToQueue.bind(this)} />
        <Title limit={this.list[0] ? this.list[0].timeLength ? this.list[0].timeLength : '' : ''} />
        <Warning timeElapsed={this.timeElapsed} visibility={this.state.warningVisibility} uponTicketed={this.uponTicketed.bind(this)} clearWarning={this.updateRows.bind(this)}/>

        <FlatList
           data={this.state.dataSource}
           ItemSeparatorComponent={this._renderSeparator}
           renderItem={this._renderItem.bind(this)}
           onRefresh={this._onRefresh.bind(this)}
           refreshing={this.state.refreshing}
           keyExtractor={this._keyExtractor}
           />

        { this.state.modalVisible ? <Done navigation={this.props.navigation} /> : <View /> }

      </View>
    );
  }

  componentWillMount() {
    this._getUserInfo();
    this.ticketCount = this.realm.objects('Ticketed')[0]['list'].length;
    this._mounted = true;
  }

  componentWillUnmount() {
    if (this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length && this.settings.dataUpload) {
      setUserTickets(this.refPath, this.realm.objects('Ticketed')[0]['list']);
    }
    this.props.navigation.state.params = undefined;
    this._mounted = false;
  }

  async _getUserInfo() {
    this.settings = await AsyncStorage.getItem('@Enforce:settings');
    this.settings = JSON.parse(this.settings);
    this.refPath = await AsyncStorage.getItem('@Enforce:refPath');
    this.updateRows();
  }

  _onRefresh() {
    this.setState({
      refreshing: true,
      dataSource: this.list,
    });
    setTimeout(() => { this._mounted && this.setState({refreshing: false})}, 1500);
  }

  updateRows(clearWarning, only) {
    if (this.list.length === 0 && clearWarning) {
      this._mounted && this.setState({
        dataSource: this.list,
        modalVisible: true, // Show the "Done" button to indicate end of list.
        warningVisibility: false,
      });
    } else if (this.list.length === 0) {
      this._mounted && this.setState({
        //dataSource: this.list,
        modalVisible: true, // Show Done sign. TODO Change UI
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

  uponTicketed(timer, force) { // Handle updates to Realm for regular and forced.
    if (Array.isArray(timer)) timer = this._timer;
    let now = new Date();
    if (now - timer.createdAt >= timer.timeLength * 60 * 60 * 1000 || force) {
      let timers = this.realm.objects('Timers')[timer.index]['list'];
      if (timers['0'].createdAt === timer.createdAt) {
        this.realm.write(() => {
          timer.ticketedAt = now / 1;
          timer.license = this.license;
          timer.VIN = this.VIN;
          this.realm.objects('Ticketed')[0]['list'].push(timer);
          timers.shift();
        });
      } else {
        let indexOfTimer;
        for (let index in timers) {
          if (timers[index].createdAt === timer.createdAt) {
            indexOfTimer = index;
            break;
          }
        }
        if (indexOfTimer) {
          this.realm.write(() => {
            timer.ticketedAt = new Date() / 1;
            timer.license = this.license;
            timer.VIN = this.VIN;
            this.realm.objects('Ticketed')[0]['list'].push(timer);
            timers.splice(parseInt(indexOfTimer), 1);
          });
        }
      }
      if (this.license) this.resetLicenseAndVIN();
      if (this.settings.imageUpload) {
        let rnfbURI = RNFetchBlob.wrap(timer.mediaPath);
        Blob
          .build(rnfbURI, {type: 'image/jpg;'})
          .then((blob) => {
            let month = now.getMonth() + 1;
            let day = now.getDate();
            date = `${month}-${day}`;
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
  }

  expiredFunc(timer) {
    let timers = this.realm.objects('Timers')[timer.index]['list'];
    if (timers['0'] === timer) {
      this.realm.write(() => {
        if (this.license) timer.license = this.license;
        this.realm.objects('Expired')[0]['list'].push(timer);
        timers.shift();
      });
      if (this.license) this.resetLicenseAndVIN();
      this.updateRows();
      return;
    } else {
      let indexOfTimer;
      for (let index in timers) {
        if (timers[index].createdAt === timer.createdAt) {
          indexOfTimer = index;
          break;
        }
      }
      if (indexOfTimer) {
        this.realm.write(() => {
          if (this.license) timer.license = this.license;
          this.realm.objects('Expired')[0]['list'].push(timer);
          timers.splice(parseInt(indexOfTimer), 1);
        });
        if (this.license) this.resetLicenseAndVIN();
        this.updateRows();
      }
    }
  }

  addLicenseToQueue(license) {
    this.license = license;

    // TODO
    // call fetch to AutoCheck
    // return VIN
    // this.vin = VIN
    //<VinSearch handleVINSearch={this.handleVINSearch.bind(this)}/>

    this.updateRows();
  }

  shouldResetLicense(setToFalse) {
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

  _renderItem(data) {
    return (
      <Row
        data={data.item}
        expiredFunc={this.expiredFunc.bind(this)}
        uponTicketed={this.uponTicketed.bind(this)} />
    );
  }

  _renderSeparator() {
    return <View style={styles.separator} />;
  }

  _keyExtractor(item, index) {
    return item.createdAt;
  };


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
