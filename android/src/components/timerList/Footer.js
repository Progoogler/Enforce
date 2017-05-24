import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  footer: {
    // position: 'absolute',
    // bottom: 0,
    height: 160,
  },
  button: {
    height: 180,
    width: 160,
  }
});

class Footer extends Component {

  render() {
    return (
      <View style={styles.footer}>
        <Button
          style={styles.button}
          onPress={() => {}} 
          title="Finished" />
      </View>
    );
  }
}

export default Footer;
