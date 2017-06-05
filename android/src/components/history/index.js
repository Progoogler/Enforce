import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Picker,
  ListView,
  AsyncStorage,
  StyleSheet,
} from 'react-native';
import Realm from 'realm';
import { NavigationActions } from'react-navigation';
import Database from '../../../../includes/firebase/database';

import Header from '../home/Header';
import Row from './Row';

export default class History extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.list = this.realm.objects('Ticketed')[0]['list'];
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      items: [],
      selected: 'Today',
    }
    this.settings = null;
    this.userId = null;
  }

  static navigationOptions = {
    drawerLabel: 'History',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/page-icon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />
        <Text style={styles.title}>History</Text>
        <Picker
          style={styles.picker}
          selectedValue={this.state.selected}
          onValueChange={(val, idx) => this._onValueChange(val, idx)}>
          { this.state.items.map((item) => item) }
        </Picker>
        <ListView
          //timers={this.props.navigation.state.params.timers}
          style={styles.listview}
          dataSource={this.state.dataSource}
          renderRow={(data) => <Row
                                data={data}
                                NavigationActions={NavigationActions}
                                navigation={this.props.navigation}
                                selected={this.state.selected} />}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />
      </View>
    );
  }

  componentWillMount() {
    this._getHistoryDatesRanging45Days();
  }

  _getHistoryDatesRanging45Days() {
    let today = new Date();
    let dates = [];
    let date = '';
    let day = 86400000;
    let value = '';
    dates.push(<Picker.Item style={styles.item} label="Today" value={'Today'} key={0}/>);
    for (let i = 1; i < 45; i++) {
      date = new Date(today - (day * i));
      value = `${date.getMonth() + 1}-${date.getDate()}`;
      dates.push(<Picker.Item style={styles.item} label={this._getPrettyDate(date.getMonth() + 1 + '', date.getDate() + '')} value={value} key={i}/>);
    }
    this.setState({items: dates});
  }

  async _getHistoryData(date) {
    let settings = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.userId = await AsyncStorage.getItem('@Enforce:profileId');
    this.settings = JSON.parse(settings);
    await Database.getHistoryData(this.settings.county, this.userId, date, (data) => {
      this.updating = true;
      if (data === null) {
        this._updateRows([]);
        return;
      }
      this._updateRows(data.tickets);
      this.list = data.tickets;
    });
  }

  _onValueChange(value, index) {
    this._getHistoryData(value);
    this.selected = value;
  }

  _updateRows(list) { console.log('UPDATE ROWS');
    if (!list) list = this.list;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(list),
      selected: this.selected,
    });
  }

  _getPrettyDate(month, day) {

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  picker: {
    width: 140,
  },
  listview: {
    flex: 1,
    alignSelf: 'stretch',
    //backgroundColor: 'white',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  image: {
    marginTop: 200,
  },
  title: {
    textAlign: 'center',
    color: '#4286f4',
    marginTop: 40,
    fontSize: 34,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 24,

  },
});
