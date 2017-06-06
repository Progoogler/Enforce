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
import Database from '../../../../includes/firebase/database';
import Firebase from '../../../../includes/firebase/firebase';

import Title from './Title';
import VinSearch from './VinSearch';
import Row from './Row';
import Footer from './Footer';
import Navigation from '../home/Header';
import Warning from './Warning';
import Done from './Done';
import insertionSortModified from '../home/insertionSort';

import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob;

window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

export default class TimerList extends Component {
  constructor(props) {
    super(props);
    this.realm = new Realm();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    console.log(this.props.navigation.state.params)
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
    this.warning = "";
    this.timer = null;
    this.ticketedCount = 0;
    this.profileId = '';
    this.VIN = "3512";
    this.license = "";
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
        <Navigation navigation={this.props.navigation} />
        <Title limit={this.props.navigation.state.params.timers[0] ? this.props.navigation.state.params.timers[0].timeLength : ""} />
        <Warning throwWarning={this.throwWarning.bind(this)} timeElapsed={this.warning} visibility={this.state.warningVisibility} forceTicket={this.forceTicket.bind(this)}/>
        <VinSearch handleVINSearch={this.handleVINSearch.bind(this)}/>
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
                                    updateRows={this.updateRows.bind(this)}
                                    realm={this.realm}
                                    throwWarning={this.throwWarning.bind(this)}
                                    expiredFunc={this.expiredFunc.bind(this)}
                                    resetLicenseAndVIN={this.resetLicenseAndVIN.bind(this)}
                                    license={this.license}
                                    VIN={this.VIN}
                                    RNFetchBlob={RNFetchBlob}
                                    Blob={Blob}
                                    Database={Database}
                                    Firebase={Firebase} />}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />} />
        {/* }<Footer /> TODO space out the bottom margin of listview and animate "Done"*/}
        { this.state.modalVisible ? <Done navigation={this.props.navigation} /> : <View /> }
      </View>
    );
  }

  componentWillMount() {
    this._getUserInfo();
    this.ticketCount = this.realm.objects('Ticketed')[0]['list'].length;
  }

  componentWillUnmount() {
    if (this.ticketCount !== this.realm.objects('Ticketed')[0]['list'].length &&
      this.settings.dataUpload) Database.setUserTickets(this.countyId, this.userId, this.realm.objects('Ticketed')[0]['list']);
    this.props.navigation.state.params = undefined;
  }

  async _getUserInfo() {
    this.countyId = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.settings = await AsyncStorage.getItem('@Enforce:settings');
    this.userId = await AsyncStorage.getItem('@Enforce:profileId');
    this.settings = JSON.parse(this.settings);
    this.countyId = JSON.parse(this.countyId);
    this.countyId = this.countyId.county;
    console.log(this.userId, this.countyId);
  }

  _onRefresh() {
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }

  updateRows() {
    if (this.list.length === 0) this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.list),
      modalVisible: true,
    })
    this.setState({dataSource: this.state.dataSource.cloneWithRows(this.list)});
  }

  throwWarning(timer) { // @param timer in milliseconds
    if (timer) { // Close modal if not calling with time now - timer.createdAtDate,
      let timeElapsed = (new Date() - timer.createdAt) / 1000 / 60;
      this.timer = timer;
      this.warning = `${(timeElapsed / 60 + '')[0] !== '0' ? (timeElapsed / 60 + '')[0] + ' hour and ' : ''}  ${Math.floor(timeElapsed % 60)} minutes`;
      this.setState({warningVisibility: !this.state.warningVisibility});
      return;
    }
    this.timer = null;
    this.setState({warningVisibility: !this.state.warningVisibility});
  }

  forceTicket() {
    if (this.settings.imageUpload) {
      let imagePath = `${this.timer.createdAt}`;
      let rnfbURI = RNFetchBlob.wrap(this.timer.mediaPath);
      Blob
        .build(rnfbURI, {type: 'image/jpg;'})
        .then((blob) => {
          let now = new Date();
          let month = now.getMonth() + 1;
          let day = now.getDate();
          date = `${month}-${day}`;
          let refPath = `${this.countyId}/${this.userId}/${month}-${day}`;
          Database.setTicketImage(refPath, imagePath, blob);
        });
    }
    this.realm.write(() => {
      this.timer.ticketedAt = new Date() / 1;
      this.timer.license = this.license;
      this.timer.VIN = this.VIN;
      this.realm.objects('Ticketed')[0]['list'].push(this.timer);
      this.realm.objects('Timers')[this.timer.index]['list'].shift();
    });
    this.throwWarning();
    //this.resetLicenseAndVIN();
    //Database.setUserTickets(this.userId, this.realm.objects('Ticketed')[0]['list']);
    this.updateRows();
  }

  expiredFunc(timer) {
    this.realm.write(() => {
      this.realm.objects('Expired')[0]['list'].push(timer);
      this.realm.objects('Timers')[timer.index]['list'].shift();
    });
    this.updateRows();
  }

  handleVINSearch(license) {
    Keyboard.dismiss();
    console.log('HANDLE VIN', license, this.license);
    this.license = license;

    // TODO
    // call fetch to AutoCheck
    // return VIN
    // this.vin = VIN

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
