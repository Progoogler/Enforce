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
import { NavigationActions } from'react-navigation';
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

export default class History extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.list = this._reverseRealmList(this.realm.objects('Ticketed')[0]['list']); // Display most recent first.
    this.ticketedList = this.list;
    this.state = {
      animating: true,
      dataSource: this.list,
      dateTransition: false,
      uri: '',
      isConnected: true,
      items: [],
      pickerWidth: 25 + 120,
      selected: "Today's Tickets",
      showMaximizedImage: false,
    }
    this.userId = null;
    this.userSettings = null;
  }

  static navigationOptions = {
    drawerLabel: 'History',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/page-icon.png')} /*global require*/
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Navigation navigation={this.props.navigation}/>
        <ImageModal 
          uri={this.state.uri} 
          visibility={this.state.showMaximizedImage} 
          maximizeOrMinimizeImage={this.maximizeOrMinimizeImage.bind(this)}
        />
        <Text style={styles.title}>History</Text>
        <View 
          style={{
            flexDirection: 'row',
            width: this.state.pickerWidth,
            borderBottomWidth: 1,
          }}
        >
          <Picker
            style={{
              color: primaryBlue,
              width: this.state.pickerWidth,
            }}
            selectedValue={this.state.selected}
            onValueChange={(val) => this._onValueChange(val)} 
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
           style={styles.flatlist}
           data={this.state.dataSource}
           ItemSeparatorComponent={this._renderSeparator}
           renderItem={this._renderItem.bind(this)}
           keyExtractor={this._keyExtractor} 
        />

        { this.state.isConnected ? null : <ThrowConnectionMessage/> }

      </View>
    );
  }

  _renderItem(data) {
    return (
      <Row
        data={data.item}
        NavigationActions={NavigationActions}
        navigation={this.props.navigation}
        selected={this.state.selected}
        maximizeOrMinimizeImage={this.maximizeOrMinimizeImage.bind(this)}
        userId={this.userId}
        userSettings={this.userSettings}
        getTicketImage={getTicketImage}
        dateTransition={this.state.dateTransition}
        />
    );
  }

  _renderSeparator() {
    return <View style={styles.separator} />;
  }

  _keyExtractor(item) {
    return item.createdAt;
  }

  componentWillMount() {
    this._mounted = true;
    this._getHistoryDates();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  async _getHistoryDates() {
    this.dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    var dates = [];
    if (this.dateCount) {
        this.dateCount = JSON.parse(this.dateCount);
        dates.push(<Picker.Item label="Today's Tickets" value="Today's Tickets" key={-2}/>);
        dates.push(<Picker.Item label="Today's Expired" value="Today's Expired" key={-1}/>);
        for (let i = this.dateCount.length - 1; i >= 0; i--) {
          let month = this.dateCount[i].slice(0, this.dateCount[i].indexOf('-'));
          let day = this.dateCount[i].slice(this.dateCount[i].indexOf('-') + 1, this.dateCount[i].length);
          dates.push(<Picker.Item label={this._getPrettyDate(month, day)} value={this.dateCount[i]} key={i}/>);
        }
    } else {
        dates.push(<Picker.Item label="Today's Tickets" value="Today's Tickets" key={-2}/>);
        dates.push(<Picker.Item label="Today's Expired" value="Today's Expired" key={-1}/>);
    }
    this.setState({items: dates, animating: false});
  }

  async _getHistoryData(date: string): undefined {
    var userSettings = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.userId = await AsyncStorage.getItem('@Enforce:profileId');
    this.userSettings = JSON.parse(userSettings);
    var month = date.slice(0, date.indexOf('-'));
    var day = date.slice(date.indexOf('-') + 1, date.length);
    var prettyDate = this._getPrettyDate(month, day);

    if (this.userId && this.userSettings) {
        await getHistoryData(this.userSettings.state, this.userSettings.county, this.userId, date, (data) => {
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
      this._updateRows(this.ticketedList, value.length);
      return;
    } else if (value === "Today's Expired") {
      this.list = this._reverseRealmList(this.realm.objects('Expired')[0]['list']);
      this._updateRows(this.list, value.length);
      return;
    }
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this._getHistoryData(value);
      } else {
        this.setState({animating: false, isConnected: false});
        setTimeout(() => {
          this._mounted && this.setState({isConnected: true});
        }, 5000);
      }
    });
  }

  _updateRows(list: object, length: number): undefined {
    if (!list) list = this.list;
    this.setState({
      dataSource: list,
      selected: this.selected,
      dateTransition: false,
      animating: false,
      isConnected: true,
      pickerWidth: 25 + length * 8,
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
        month = 'Octoboer';
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

History.propTypes = { navigation: PropTypes.object.isRequired }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  flatlist: {
    flex: 1,
    alignSelf: 'stretch',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  title: {
    textAlign: 'center',
    color: primaryBlue,
    marginTop: '6%',
    fontSize: xxlargeFontSize,
    fontWeight: 'bold',
    textShadowColor: titleTextShadow,
    textShadowOffset: {
      width: 1,
      height: 1
    },
  },
});
