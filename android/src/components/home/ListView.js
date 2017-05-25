import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
} from 'react-native';
import Realm from 'realm';
import Row from './Row';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginTop: 25,
  },
});

class TimersList extends Component {
  constructor() {
    super();
    this.realm = new Realm();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.list = this.realm.objects('Timers').filtered('list.createdAt > 0');
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      refreshing: false,
    };
  }

  render() {
    console.log('PROPS', this.props)
    return (
      <ListView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)} />
        }
        timers={this.list}
        style={styles.container}
        dataSource={this.state.dataSource}
        renderRow={(data) => <Row {...data} navigation={this.props.navigation}/>}
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
      />
    );
  }

  _onRefresh() {
    console.log('something');
    //this.setState({refreshing: true});
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }
}

export default TimersList;
