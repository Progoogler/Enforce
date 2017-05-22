import React, { Component } from 'react';
import {
  ListView,
  View,
  StyleSheet,
} from 'react-native';

import Row from './Row';
import Header from './ListViewHeader';

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
    this.list = this.props.navigation.state.params.timers.list;
    this.state = {
      dataSource: ds.cloneWithRows(this.list),
    };
  }

  _updateList(index) {
    
  }

  render() {
    //console.log('props', this.props.navigation.state.params.timers.list)
    return (
      <ListView
        timers={this.props.navigation.state.params.timers.list}
        style={styles.container}
        dataSource={this.state.dataSource}
        renderRow={(data) => <Row {...data} />}
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        renderHeader={() => <Header />}
      />
    );
  }
}

export default TimerList;
