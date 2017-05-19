import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  count: {
    flex: .2,
  },
  description: {
    flex: .8,
  },
});

const Row = (props) => (
  <View style={styles.container}>
    <Text style={styles.count}></Text>
    <Text style={styles.description}></Text>
  </View>
);

export default Row;
