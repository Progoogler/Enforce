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
        <View style={styles.container}>
          <View style={styles.containerBorder}>

            <Text style={styles.title}>Location Details</Text>
            <View style={styles.textInputContainer}>
              <AutoGrowingTextInput
                style={styles.textInput}
                onChange={(event) => this._handleTextInput(event)}
                underlineColorAndroid={primaryBlue}
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
    padding: '5%',
  },
  containerBorder: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: '6%',
  },
  buttonRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    margin: '4%',
  },
  cancelButton: {
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginRight: '20%',
  },
  cancelText: {
    color: primaryBlue,
    padding: '8%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: largeFontSize,
    marginBottom: '4%',
    textAlign: 'center',
  },
  textInputContainer: {
    backgroundColor: primaryBlue,
    borderRadius: 10,
    height: textInputContainerHeight,
    marginLeft: '5%',
  },
  textInput: {
    color: 'white',
  },
  count: {
    marginLeft: '8%',
    marginTop: '2%',
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: primaryBlue,
    borderRadius: 6,
  },
  doneText: {
    color: 'white',
    padding: '5%',
  },
});
