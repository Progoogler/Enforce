import React, { Component } from 'react';
import {
  ListView,
  View,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import Title from './Title';
import VinSearch from './VinSearch';
import Row from './Row';
import Footer from './Footer';
import Navigation from '../home/Header';

const styles = StyleSheet.create({
  container: {

  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});

class TimerList extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.list = this.props.navigation.state.params.timers;
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
      refreshing: false,
    };
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

  render() {
    return (
      <View>
        <Navigation navigation={this.props.navigation} />
        <Title limit={this.props.navigation.state.params.timers[0] ? this.props.navigation.state.params.timers[0].timeLength : ""} />
        <VinSearch />
        <ListView
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)} />
          }
          //timers={this.props.navigation.state.params.timers}
          style={styles.container}
          dataSource={this.state.dataSource}
          renderRow={(data) => <Row data={data} updateRows={this.updateRows.bind(this)}/>}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
          renderFooter={() => <Footer/>} />
        <Footer />
      </View>
    );
  }
}

export default TimerList;
