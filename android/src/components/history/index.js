import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  NetInfo,
  Picker,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import PropTypes from 'prop-types';
import Realm from 'realm';

import { getHistoryData, getTicketImage } from '../../../../includes/firebase/database';

import ImageModal from './ImageModal';
import Navigation from '../navigation';
import Row from './Row';
import ThrowConnectionMessage from '../profile/ThrowConnectionMessage';
import {
  primaryBlue,
  titleTextShadow,
  xxlargeFontSize,
} from '../../styles/common';

/*global require*/
export default class History extends Component {
  constructor() {
    super();
    this.mounted = false;
    this.profileId = null;
    this.profileSettings = null;
    this.realm = new Realm(); 
    this.state = {
      animating: true,
      dataSource: this._reverseRealmList(this.realm.objects('Ticketed')[0]['list']), // Display most recent first.
      dateTransition: false,
      uri: '',
      isConnected: true,
      items: [],
      pickerWidth: 25 + 120,
      selected: "Today's Tickets",
      showMaximizedImage: false,
    }
  }

  static navigationOptions = {
    drawerLabel: 'History',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/page-icon.png')}/>
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Navigation 
          displayFirebaseResult={this.displayFirebaseResult.bind(this)}
          historyScreen={true} 
          navigation={this.props.navigation} 
          refPath={this.props.screenProps.refPath}
        />
        <ImageModal 
          maximizeOrMinimizeImage={this.maximizeOrMinimizeImage.bind(this)}
          uri={this.state.uri} 
          visibility={this.state.showMaximizedImage} 
        />
        <Text style={styles.title}>History</Text>
        <View 
          style={{
            borderBottomWidth: 1,
            flexDirection: 'row',
            width: this.state.pickerWidth,
          }}
        >
          <Picker
            style={{
              color: primaryBlue,
              width: this.state.pickerWidth,
            }}
            onValueChange={(val) => this._onValueChange(val)} 
            selectedValue={this.state.selected}
          >

            { this.state.items }

          </Picker>
          <ActivityIndicator
            animating={this.state.animating}
            color={'green'}
            size='small' 
          />
        </View>

        <FlatList
           data={this.state.dataSource}
           ItemSeparatorComponent={this._renderSeparator}
           keyExtractor={this._keyExtractor} 
           removeClippedSubviews={true}
           renderItem={this._renderItem.bind(this)}
           style={styles.flatlist}
        />

        { this.state.isConnected ? null : <ThrowConnectionMessage/> }

      </View>
    );
  }

  _renderItem(data) {
    return (
      <Row
        data={data.item}
        selected={this.state.selected}
        maximizeOrMinimizeImage={this.maximizeOrMinimizeImage.bind(this)}
        profileId={this.profileId}
        profileSettings={this.profileSettings}
        getTicketImage={getTicketImage}
        dateTransition={this.state.dateTransition}
      />
    );
  }

  _renderSeparator() {
    return <View style={styles.separator}/>;
  }

  _keyExtractor(item) {
    return item.createdAt;
  }

  componentWillMount() {
    this._getHistoryDates();
  }

  componentDidMount() {
    this.mounted = true;
    this._getProfileInfo();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  displayFirebaseResult(results: array) {
    if (results.length <= 1) return;
    // Select Picker at the first object's Date
    this._parseDate(results[0].createdAt, (length) => { console.log('len', length)
      // UpdateRows() w/ the data
      this._updateRows(results, length);
    });
  }

  async _getProfileInfo() {
    this.profileSettings = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.profileId = await AsyncStorage.getItem('@Enforce:profileId');
    this.profileSettings = JSON.parse(this.profileSettings);
  }

  async _getHistoryDates() {
    var dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    var dates = [];
    if (dateCount) {
        dateCount = JSON.parse(dateCount);
        dates.push(<Picker.Item label="Today's Tickets" value="Today's Tickets" key={-2}/>);
        dates.push(<Picker.Item label="Today's Expired" value="Today's Expired" key={-1}/>);
        for (let i = dateCount.length - 1; i >= 0; i--) {
          let month = dateCount[i].slice(0, dateCount[i].indexOf('-'));
          let day = dateCount[i].slice(dateCount[i].indexOf('-') + 1, dateCount[i].length);
          dates.push(<Picker.Item label={this._getPrettyDate(month, day)} value={dateCount[i]} key={i}/>);
        }
    } else {
        dates.push(<Picker.Item label="Today's Tickets" value="Today's Tickets" key={-2}/>);
        dates.push(<Picker.Item label="Today's Expired" value="Today's Expired" key={-1}/>);
    }
    this.setState({items: dates, animating: false});
  }

  _parseDate(date, cb) {
    var dateObj = new Date(date);
    var month = dateObj.getMonth() + 1 + '';
    var day = dateObj.getDate() + '';
    var prettyDate = this._getPrettyDate(month, day);
    this.selected = `${month}-${day}`;
    cb(prettyDate.length);
  }

  async _getHistoryData(date: string): undefined {
    var month = date.slice(0, date.indexOf('-'));
    var day = date.slice(date.indexOf('-') + 1, date.length);
    var prettyDate = this._getPrettyDate(month, day);

    if (this.profileId && this.profileSettings) {
        await getHistoryData(this.profileSettings.state, this.profileSettings.county, this.profileId, date, (data) => {
          this.updating = true;
          if (data === null) {
            this._updateRows([], prettyDate.length);
            return;
          }
          this._updateRows(data.tickets, prettyDate.length);
        });
    } else {
      this._updateRows([], prettyDate.length);
    }
  }

  _onValueChange(value: string): undefined {
    this.setState({animating: true, dateTransition: true});
    this.selected = value;
    if (value === "Today's Tickets") {
      this._updateRows(this._reverseRealmList(this.realm.objects('Ticketed')[0]['list']), value.length);
      return;
    } else if (value === "Today's Expired") {
      this._updateRows(this._reverseRealmList(this.realm.objects('Expired')[0]['list']), value.length);
      return;
    }
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this._getHistoryData(value);
      } else {
        this.setState({animating: false, isConnected: false});
        setTimeout(() => {
          this.mounted && this.setState({isConnected: true});
        }, 5000);
      }
    });
  }

  _updateRows(list: object, length: number): undefined {
    this.setState({
      animating: false,
      dataSource: list,
      dateTransition: false,
      isConnected: true,
      pickerWidth: 25 + length * 8,
      selected: this.selected,
    });
  }

  _reverseRealmList(list: object): array {
    let reversedList = [];
    for (let i = list.length - 1; i >= 0; i--) {
      reversedList.push(list[i]);
    }
    return reversedList;
  }

  maximizeOrMinimizeImage(uri?: string): undefined {
    if (uri) {
      this.setState({showMaximizedImage: true, uri: uri});
    } else {
      this.setState({showMaximizedImage: false, uri: ''});
    }
  }

  _getPrettyDate(month: string, day: string): string {

    switch (month) {
      case '1':
        month = 'January';
        break;
      case '2':
        month = 'February';
        break;
      case '3':
        month = 'March';
        break;
      case '4':
        month = 'April';
        break;
      case '5':
        month = 'May';
        break;
      case '6':
        month = 'June';
        break;
      case '7':
        month = 'July';
        break;
      case '8':
        month = 'August';
        break;
      case '9':
        month = 'September';
        break;
      case '10':
        month = 'October';
        break;
      case '11':
        month = 'November';
        break;
      case '12':
        month = 'December';
        break;
      default:
        break;
    }

    switch (day) {
      case '1':
        day = '1st';
        break;
      case '2':
        day = '2nd';
        break;
      case '3':
        day = '3rd';
        break;
      case '21':
        day = '21st';
        break;
      case '22':
        day = '22nd';
        break;
      case '23':
        day = '23rd';
        break;
      case '31':
        day = '31st';
        break;
      default:
        day = `${day}th`;
    }
    return `${month} ${day}`;
  }
}

History.propTypes = { 
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  flatlist: {
    alignSelf: 'stretch',
    flex: 1,
  },
  separator: {
    backgroundColor: '#8E8E8E',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  title: {
    color: primaryBlue,
    fontSize: xxlargeFontSize,
    fontWeight: 'bold',
    marginTop: '6%',
    textAlign: 'center',
    textShadowColor: titleTextShadow,
    textShadowOffset: {
      width: 1,
      height: 1
    },
  },
});
