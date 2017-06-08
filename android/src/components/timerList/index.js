import React, { Component } from 'react';
import {
  ListView,
  View,
  Image,
  StyleSheet,
  RefreshControl,
  AsyncStorage,
  Keyboard,
} from 'react-native';
import Realm from 'realm';
import { setUserTickets, setTicketImage } from '../../../../includes/firebase/database';

import Title from './Title';
import VinSearch from './VinSearch';
import Row from './Row';
import Footer from './Footer';
import Navigation from '../navigation';
import Warning from './Warning';
import Done from './Done';
import insertionSortModified from '../home/insertionSort';

import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob; // Initialize Blob for converting images into binary
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

export default class TimerList extends Component {
  constructor(props) {
    super(props);
    this.realm = new Realm();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    if (!this.props.navigation.state.params) {
      this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');
      this.list = this.list.length > 0 ? this.list[0].list : {};
      this.props.navigation.state.params = {};
      this.props.navigation.state.params.timers = this.list;
    } else {
      this.list = this.props.navigation.state.params.timers;
    }
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      refreshing: false,
      warningVisibility: false,
      modalVisible: false,
    };
    this.timer = null;
    this.ticketedCount = 0;
    this.VIN = "";
    this.license = '';
    this.timeElapsed = '';
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
        <Navigation navigation={this.props.navigation} search={true} />
        <Title limit={this.props.navigation.state.params.timers[0] ? this.props.navigation.state.params.timers[0].timeLength : ""} />
        <Warning timeElapsed={this.timeElapsed} visibility={this.state.warningVisibility} uponTicketed={this.uponTicketed.bind(this)} clearWarning={this.updateRows.bind(this)}/>

        <ListView
          enableEmptySections={true}
          // In next release empty section headers will be rendered.
          // Until then, leave this property alone to mitigate the warning msg.
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)} />
          }
          //timers={this.props.navigation.state.params.timers}
          style={styles.container}
          dataSource={this.state.dataSource}
          renderRow={(data) => <Row data={data}
                                    expiredFunc={this.expiredFunc.bind(this)}
                                    uponTicketed={this.uponTicketed.bind(this)} />}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />} />


        { this.state.modalVisible ? <Done navigation={this.props.navigation} /> : <View /> }


      </View>
    );
  }

  componentWillMount() {
    this._getUserInfo();
    this.ticketCount = this.realm.objects('Ticketed')[0]['list'].length;
  }

  componentWillUnmount() {
    if (this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length && this.settings.dataUpload) {
      setUserTickets(this.refPath, this.realm.objects('Ticketed')[0]['list']);
    }
    this.props.navigation.state.params = undefined;
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
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }

  updateRows(clearWarning, only) {
    if (this.list.length === 0 && clearWarning) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.list),
        modalVisible: true, // Show the "Done" button to indicate end of list.
        warningVisibility: false,
      });
    } else if (this.list.length === 0) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.list),
        modalVisible: true,
      });
    } else if (clearWarning && only) {
      this.setState({
        warningVisibility: false,
      });
    } else if (clearWarning) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.list),
        warningVisibility: false,
      });
    } else {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.list),
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
        console.log('uploading file')
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
      this.setState({
        warningVisibility: true,
      });
    }
  }

  expiredFunc(timer) {
    let timers = this.realm.objects('Timers')[timer.index]['list'];
    if (timers['0'] === timer) {
      this.realm.write(() => {
        this.realm.objects('Expired')[0]['list'].push(timer);
        timers.shift();
      });
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
          this.realm.objects('Expired')[0]['list'].push(timer);
          timers.splice(parseInt(indexOfTimer), 1);
        });
        this.updateRows();
      }
    }
  }

  handleVINSearch(license) {
    Keyboard.dismiss();
    console.log('HANDLE VIN', license, this.license);
    this.license = license;

    // TODO
    // call fetch to AutoCheck
    // return VIN
    // this.vin = VIN
    //<VinSearch handleVINSearch={this.handleVINSearch.bind(this)}/>

    this.updateRows();
  }

  resetLicenseAndVIN() {
    this.license = '';
    this.VIN = '';
  }
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
