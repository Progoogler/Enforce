import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  },
  mapButton: {
    flex: .5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    color: 'white',
    fontSize: 18,
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
    height: 40,
  },
  refreshButton: {
    flex: .5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: 'white',
    fontSize: 18,
  },
});

class HeaderButtons extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={styles.mapButton}
          onPress={()=>{}}>
          <Text style={styles.mapText}>Show Map</Text>
        </TouchableHighlight>
        <View style={styles.separator} />
        <TouchableHighlight
          style={styles.refreshButton}
          onPress={()=>{}}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

export default HeaderButtons;
