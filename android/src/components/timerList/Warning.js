import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import {
  largeFontSize,
  mediumFontSize,
  primaryBlue,
  warningContainerMarginTop,
} from '../../styles/common';

export default class Warning extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal 
        animationType={"fade"}
        onRequestClose={() => this.props.clearWarning('clearWarning', 'only')}
        transparent={true}
        visible={this.props.visibility} 
      >
        <View style={styles.container}>
          <View style={styles.containerBorder}>
            <Text style={styles.message}> Vehicle has parked for </Text>
            <Text style={styles.warning}> {this.props.timeElapsed} </Text>
            <Text style={styles.message}> Are you sure </Text>
            <Text style={styles.message}> you want to ticket now? </Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                activeOpacity={.8}
                onPress={() => this.props.clearWarning('clearWarning', 'only')}
                style={styles.no}
              >
                <Text style={styles.noButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={.6}
                onPress={() => this.props.uponTicketed([], 'force')}
                style={styles.yes}
              >
                <Text style={styles.yesButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.timeElapsed !== nextProps.timeElapsed) return true;
    if (this.props.visibility !== nextProps.visibility) return true;
    return false;
  }

}

Warning.propTypes = {
  clearWarning: PropTypes.func.isRequired,
  timeElapsed: PropTypes.string.isRequired,
  uponTicketed: PropTypes.func.isRequired,
  visibility: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: primaryBlue,
    marginTop: warningContainerMarginTop,
    padding: '5%',
  },
  containerBorder: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: '6%',
  },
  warning: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: largeFontSize,
    margin: '3%',
  },
  message: {
    fontSize: mediumFontSize,
  },
  buttons: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '6%',
  },
  noButtonText: {
    color: primaryBlue,
    padding: '8%',
  },
  no: {
		alignItems: 'center',
		justifyContent: 'center',
    marginRight: '20%',
  },
  yesButtonText: {
    color: 'white',
  },
  yes: {
    backgroundColor: primaryBlue,
    borderRadius: 5,
    padding: '5%',
  },
});
 