import React, { Component } from 'react';
import {
  ListView,
  View,
  StyleSheet,
} from 'react-native';

import Title from './Title';
import Row from './Row';
import Footer from './Footer';
import Header from './ListViewHeader';
import Navigation from '../home/Header';

const styles = StyleSheet.create({
  container: {

  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  // footer: {
  //   height: 360,
  // }
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
      <View>
        <Navigation navigation={this.props.navigation} />
        <Title limit={this.props.navigation.state.params.timers.list[0].timeLength} />
        <ListView
          timers={this.props.navigation.state.params.timers.list}
          style={styles.container}
          dataSource={this.state.dataSource}
          renderRow={(data) => <Row {...data} />}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
          renderFooter={() => <Footer/>}
        />
        <Footer />
      </View>
    );
  }
}

export default TimerList;
