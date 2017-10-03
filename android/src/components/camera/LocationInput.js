import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';
import PropTypes from 'prop-types';
 
import {
  largeFontSize,
  mediumFontSize,
  navigationBarHeight,
  primaryBlue,
  textInputContainerHeight,
} from '../../styles/common';

export default class LocationInput extends Component {
  constructor() {
    super();
    this.state = {
      text: '',
    }
  }

  render() {
    return (
      <Modal animationType={'slide'}
        transparent={true}
        visible={this.props.visibility}
        onRequestClose={() => this.props.setModalVisible(this.state.text)} >
        <View style={styles.container} >


          <Text style={styles.title}>Location Details:</Text>
          <View style={styles.textInputContainer}>
            <AutoGrowingTextInput
              style={styles.textInput}
              onChange={(event) => this._handleTextInput(event)}
              underlineColorAndroid={'white'}
              autoCorrect={false}
              autoCapitalize={'sentences'}
              fontSize={26}
              maxLength={75}
              minHeight={120}
              autoFocus={true}
              value={this.state.text} />

            </View>
            <Text style={styles.count}>{75 - this.state.text.length} characters remaining</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  this.setState({text: ''});
                  this.props.setModalVisible('');
                }}>
                <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={.6}
                onPress={() => {
                  this.props.setModalVisible(this.state.text);
                  this.setState({text: ''});
                }} >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

        </View>
      </Modal>
    );
  }

  _handleTextInput(event) {
    this.setState({ text: event.nativeEvent.text || '' });
  }
}

LocationInput.propTypes = {
  visibility: PropTypes.bool.isRequired,
  setModalVisible: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: primaryBlue,
    marginTop: navigationBarHeight,
    padding: '4%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    margin: '4%',
  },
  cancelButton: {
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginRight: '12%',
      marginBottom: '2%',
  },
  cancelText: {
    color: 'white',
    fontSize: mediumFontSize,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: largeFontSize,
    marginLeft: '5%',
  },
  textInputContainer: {
    marginLeft: '5%',
    height: textInputContainerHeight,
  },
  count: {
    marginLeft: '8%',
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: 'green',
    padding: '2%',
    borderRadius: 6,
  },
  doneText: {
    fontSize: mediumFontSize,
    color: 'white',
  },
});
