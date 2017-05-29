import React, { Component } from 'react';
import {
  ListView,
  View,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Realm from 'realm';

import Title from './Title';
import VinSearch from './VinSearch';
import Row from './Row';
import Footer from './Footer';
import Navigation from '../home/Header';
import Warning from './Warning';


export default class TimerList extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.list = this.props.navigation.state.params.timers;
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      refreshing: false,
      warningVisibility: false,
    };
    this.warning = "";
    this.timer = null;
    this.realm = new Realm();
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
        <VinSearch />
        <ListView
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
                                    expiredFunc={this.expiredFunc.bind(this)}/>}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />} />
        {/* }<Footer /> TODO space out the bottom margin of listview and animate "Done"*/}
      </View>
    );
  }


  _onRefresh() {
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }

  updateRows() {
    this.setState({dataSource: this.state.dataSource.cloneWithRows(this.list)});
  }

  throwWarning(timer) { // time in milliseconds
    if (timer) { // Close modal if not calling with time now - timer.createdAtDate,
      let timeElapsed = (new Date() - timer.createdAtDate) / 1000 / 60;
      this.timer = timer;
      this.warning = `${(timeElapsed / 60 + '')[0] !== '0' ? (timeElapsed / 60 + '')[0] + ' hour and ' : ''}  ${Math.floor(timeElapsed % 60)} minutes`;
      this.setState({warningVisibility: !this.state.warningVisibility});
      return;
    }
    this.timer = null;
    this.setState({warningVisibility: !this.state.warningVisibility});
  }

  forceTicket() {
    this.realm.write(() => {
      this.timer.ticketedAtDate = new Date();
      this.realm.objects('Ticketed')[0]['list'].push(this.timer);
      this.realm.objects('Timers')[this.timer.index]['list'].shift();
    });
    this.timer = null;
    this.updateRows();
  }

  expiredFunc(timer) {
    this.realm.write(() => {
      this.realm.objects('Expired')[0]['list'].push(timer);
      this.realm.objects('Timers')[timer.index]['list'].shift();
    });
    this.updateRows();
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
