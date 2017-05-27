import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
} from 'react-native';
import Realm from 'realm';
import RNFS from 'react-native-fs';
import Row from './Row';
import insertionSortModified from './insertionSort';

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
    this.list = this.realm.objects('Timers').filtered('list.createdAt >= 0');

    // TODO Fix the case where list.length === 1 : does not appear in listview

    this.list = insertionSortModified(this.list);
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      refreshing: false,
    };
  }

  render() {
    console.log('list', this.list)
    return (
      <ListView
        enableEmptySections={true}
        // In next release empty section headers will be rendered.
        // Until then, leave this property alone to mitigate the warning msg.
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)} />
        }
        timers={this.list}
        style={styles.container}
        dataSource={this.state.dataSource}
        renderRow={(data) => <Row {...data} navigation={this.props.navigation} deleteRow={this.deleteRow.bind(this)}/>}
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
      />
    );
  }

  deleteRow(timers) {
    console.log('DEL' ,timers)

    timers.forEach((timer, idx) => {
      RNFS.unlink(timer.mediaPath)
      .then(() => {
        console.log('FILE DELETED');
        // RNFS.exists(timer.mediaUri)
        // .then(() => {
        //   console.log('PICTURE REMOVED');
        //   this.realm.write(() => {
        //     this.realm.de
        //     this.realm.delete(timer[idx]['list'][sidx]);
        //   });
        // });
      });
    });

    console.log('before loop', this.list)
    for (let timerObj in this.list) {
      if (this.list[timerObj].list === timers) {
        this.list[timerObj].list = {};
      }
    }
    console.log('after loop', this.list);

    setTimeout(() => {
      this.realm.write(() => {
        this.realm.delete(timers);
      });
      this._onRefresh();
    }, 2000);
  }

  _onRefresh() {
    this.setState({
      refreshing: true,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.list)
    });
    this.setState({refreshing: false});
  }
}

export default TimersList;
