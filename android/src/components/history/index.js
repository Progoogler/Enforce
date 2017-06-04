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
//import Listview from './ListView';
import Row from './Row';

export default class History extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    this.list = this.realm.objects('Ticketed')[0]['list'];
    console.log('this list', this.list);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      items: [],
      selected: 'Today',
    }
    this.settings = null;
    this.userId = null;
    this.data = null;
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
          renderRow={(data) => <Row data={data} NavigationActions={NavigationActions} navigation={this.props.navigation}/>}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />
      </View>
    );
  }

  componentWillMount() {
    this._getHistoryData();
  }

  componentDidMount() {

  }

  async _getHistoryData() {
    let settings = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.userId = await AsyncStorage.getItem('@Enforce:profileId');
    this.settings = JSON.parse(settings);
    Database.getHistoryDates(this.settings.county, this.userId, (data) => {
      this.data = data;
      let items = [];
      let i = 0;
      items.push(<Picker.Item style={styles.item} label="Today" value={'Today'} key={i}/>);
      for (let date in this.data) {
        items.push(<Picker.Item style={styles.item} label={this._getPrettyDate(date)} value={date} key={i++}/>);
      }
      this.setState({items});
      console.log('THE DATA', this.data )
    });
  }

  _onValueChange(value, index) {
    this.list = this.data[value].tickets;
    this.selected = value;
    this._updateRows();
  }

  _updateRows() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.list),
      selected: this.selected,
    });
  }

  _getPrettyDate(date) {
    let month = '';
    let day = '';
    let i = 0;
    while (date[i] !== '-') {
      month += date[i];
      i++;
    }
    i++;
    while (i < date.length) {
      day += date[i];
      i++;
    }
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
