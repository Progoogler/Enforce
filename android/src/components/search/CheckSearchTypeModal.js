import React, { Component } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

import {
  primaryBlue,
  largeFontSize,
  mediumFontSize,
  mainButtonsHeight,
  warningContainerMarginTop,
} from '../../styles/common';

export default class checkForTypeOfSearch extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => {this.props.handleHistorySearchWith('closeModal')}}
        visible={this.props.visibility}>

        <View style={styles.container}>
          <View style={styles.containerBorder}>
            <Text style={styles.question}> {"Look up a past license or VIN?"} </Text>
            <View style={styles.buttonRow}>
              <View style={styles.buttonColumn}>
                <TouchableOpacity
                  class={styles.button}
                  opacity={.8}
                  onPress={() => this.props.handleHistorySearchWith('license')}>
                  <Text>License</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonColumn}>
                <TouchableOpacity
                  class={styles.button}
                  opacity={.8}
                  onPress={() => this.props.handleHistorySearchWith('VIN')}>
                  <Text>VIN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: warningContainerMarginTop,
    backgroundColor: primaryBlue,
    padding: "5%",
  },
  containerBorder: {
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5,
    padding: '6%',
  },
  question: {
    fontSize: mediumFontSize,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    height: mainButtonsHeight,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
