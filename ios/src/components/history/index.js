import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Picker,
  AsyncStorage,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import FlatList from 'react-native/Libraries/Lists/FlatList';

import Realm from 'realm';
import { NavigationActions } from'react-navigation';
import { getHistoryData, getTicketImage } from '../../../../includes/firebase/database';

import Navigation from '../navigation';
import Row from './Row';
import ImageModal from './ImageModal';

export default class History extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.list = this._reverseRealmList(this.realm.objects('Ticketed')[0]['list']); // Display most recent first.
    this.ticketedList = this.list;
    this.state = {
      dataSource: this.list,
      items: [],
      selected: "Today's Tickets",
      animating: true,
      dateTransition: false,
      showMaximizedImage: false,
      uri: '',
    }
    this.userSettings = null;
    this.userId = null;
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
        <Navigation navigation={this.props.navigation} />
        <ImageModal uri={this.state.uri} visibility={this.state.showMaximizedImage} maximizeImage={this.maximizeImage.bind(this)}/>
        <Text style={styles.title}>History</Text>
        <View style={styles.pickerActivityRow}>
          <Picker
            style={styles.picker}
            selectedValue={this.state.selected}
            onValueChange={(val) => this._onValueChange(val)} >

            { this.state.items.map((item) => item) }

          </Picker>
          <ActivityIndicator
            animating={this.state.animating}
            color={'green'}
            size='small' />
        </View>

        <FlatList
           style={styles.flatlist}
           data={this.state.dataSource}
           ItemSeparatorComponent={this._renderSeparator}
           renderItem={this._renderItem.bind(this)}
           keyExtractor={this._keyExtractor} />

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
        maximizeImage={this.maximizeImage.bind(this)}
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
    this._getHistoryDates();
  }

  async _getHistoryDates() {
    this.dateCount = await AsyncStorage.getItem('@Enforce:dateCount');
    this.dateCount = JSON.parse(this.dateCount);
    let dates = [];
    dates.push(<Picker.Item style={styles.item} label="Today's Tickets" value={"Today's Tickets"} key={-2}/>);
    dates.push(<Picker.Item style={styles.item} label="Today's Expired" value={"Today's Expired"} key={-1}/>);
    for (let i = this.dateCount.length - 1; i >= 0; i--) {
      let month = this.dateCount[i].slice(0, this.dateCount[i].indexOf('-'));
      let day = this.dateCount[i].slice(this.dateCount[i].indexOf('-') + 1, this.dateCount[i].length);
      dates.push(<Picker.Item style={styles.item} label={this._getPrettyDate(month, day)} value={this.dateCount[i]} key={i}/>);
    }
    this.setState({items: dates, animating: false});
  }

  async _getHistoryData(date: string): undefined {
    let userSettings = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.userId = await AsyncStorage.getItem('@Enforce:profileId');
    this.userSettings = JSON.parse(userSettings);

    await getHistoryData(this.userSettings.county, this.userId, date, (data) => {
      this.updating = true;
      if (data === null) {
        this._updateRows([]);
        return;
      }
      this._updateRows(data.tickets);
    });

  }

  _onValueChange(value: string): undefined {
    this.setState({animating: true, dateTransition: true});
    if (value === "Today's Tickets") {
      this.selected = value;
      this._updateRows(this.ticketedList);
      return;
    } else if (value === "Today's Expired") {
      this.list = this._reverseRealmList(this.realm.objects('Expired')[0]['list']);
      this.selected = value;
      this._updateRows(this.list);
      return;
    }
    this._getHistoryData(value);
    this.selected = value;
  }

  _updateRows(list: object): undefined {
    if (!list) list = this.list;
    this.setState({
      dataSource: list,
      selected: this.selected,
      dateTransition: false,
      animating: false,
    });
  }

  _reverseRealmList(list: object): array {
    let reversedList = [];
    for (let i = list.length - 1; i >= 0; i--) {
      reversedList.push(list[i]);
    }
    return reversedList;
  }

  maximizeImage(uri?: string): undefined {
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
  pickerActivityRow: {
    flexDirection: 'row',
  },
  picker: {
    width: 150,
    color: '#4286f4',
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
    color: '#4286f4',
    marginTop: 25,
    fontSize: 34,
    fontWeight: 'bold',
    textShadowColor: 'grey',
    textShadowOffset: {
      width: 1,
      height: 1
    },
  },
});
