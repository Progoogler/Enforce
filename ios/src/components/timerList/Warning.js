import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  primaryBlue,
  largeFontSize,
  mediumFontSize,
  warningContainerMarginTop,
} from '../../styles/common';

export default class Warning extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => {this.props.clearWarning('clearWarning', 'only')}}
        visible={this.props.visibility} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >

            <Text style={styles.message}> Vehicle has parked for </Text>
            <Text style={styles.warning}> {this.props.timeElapsed} </Text>
            <Text style={styles.message}> Are you sure </Text>
            <Text style={styles.message}> you want to ticket now? </Text>
            <View style={styles.buttons} >
              <TouchableOpacity
                style={styles.no}
                activeOpacity={.8}
                onPress={() => {this.props.clearWarning('clearWarning', 'only')}} >
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.yes}
                activeOpacity={.6}
                onPress={() => { this.props.uponTicketed([], 'force')}} >
                <Text style={styles.yesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

Warning.propTypes = {
  clearWarning: PropTypes.func.isRequired,
  visibility: PropTypes.bool.isRequired,
  timeElapsed: PropTypes.string.isRequired,
  uponTicketed: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    marginTop: warningContainerMarginTop,
    backgroundColor: primaryBlue,
    padding: '5%',
  },
  containerBorder: {
    backgroundColor: 'white',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '6%',
  },
  noButtonText: {
    fontSize: largeFontSize,
    fontWeight: 'bold',
    color: 'white',
  },
  yesButtonText: {
    fontSize: largeFontSize,
    color: primaryBlue,
  },
  no: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: primaryBlue,
    marginRight: '15%',
    padding: '3%',
  },
});
