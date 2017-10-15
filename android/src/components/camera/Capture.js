import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'; 
import PropTypes from 'prop-types';

import { 
  captureContainerHeight, 
  mediumFontSize, 
  primaryBlue, 
} from '../../styles/common';
 
var buttonSize = captureContainerHeight - 10;

export default class Capture extends Component {
  render() { console.log('capture renders')
    return (
      <View style={styles.footer}>
        <View style={styles.pinContainer}>
          <TouchableOpacity
            activeOpacity={.6}
            onPress={() => this.props.setModalVisible()} 
          >
            <Image
              source={require('../../../../shared/images/pin.png')}
              style={styles.pinIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.captureContainer}>
          <TouchableOpacity
            activeOpacity={.6}
            onPress={() => this.props.takePicture()} 
            style={styles.capture}
          >
            <View></View>
          </TouchableOpacity>
        </View>

        <View style={styles.undoContainer}>
          <TouchableOpacity
            activeOpacity={.6}
            style={styles.undoButton} 
          >
            <Text
              style={styles.undo}
              onPress={() => this.props.deletePreviousPicture()}
            >
              { 'UNDO' }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  shouldComponentUpdate() {
    return false;
  }
}

Capture.propTypes = {
  deletePreviousPicture: PropTypes.func.isRequired,
  setModalVisible: PropTypes.func.isRequired,
  takePicture: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  capture: {
    alignSelf: 'center',
    borderColor: 'white',
    borderRadius: buttonSize / 2,
    borderWidth: 1,
    height: buttonSize,
    width: buttonSize,
  },
  captureContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    flexDirection: 'row',
    height: captureContainerHeight,
    justifyContent: 'center',
    paddingLeft: '2%',
    paddingRight: '2%',
  },
  pinContainer: {
    flex: 1,
  },
  undo: {
    color: primaryBlue,
    fontSize: mediumFontSize,
  },
  undoButton: {
    alignSelf: 'flex-end',
  },
  undoContainer: {
    flex: 1,
  },
});
