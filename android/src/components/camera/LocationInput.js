import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';

export default class LocationInput extends Component {
  constructor() {
    super();
    this.state = {
      text: '',
    }
    this._textInput;
  }

  render() {
    return (
      <Modal animationType={'slide'}
        transparent={true}
        visible={this.props.visibility}
        onRequestClose={() => this.props.setModalVisible(this.state.text)} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >

            <Text style={styles.title}>Location Details:</Text>
            <View style={styles.textInputContainer}>
              <AutoGrowingTextInput
                style={styles.textInput}
                ref={(ref) => this._textInput = ref}
                onChange={(event) => this._handleTextInput(event)}
                underlineColorAndroid={'white'}
                autoCorrect={false}
                autoCapitalize={'sentences'}
                fontSize={26}
                maxLength={60}
                minHeight={120}
                autoFocus={true}
                value={this.state.text} />

            </View>
            <Text style={styles.count}>{60 - this.state.text.length} characters remaining</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.xButton}
                onPress={() => {
                  this.setState({text: ''});
                  this.props.setModalVisible('');
                }}>
                <Text style={styles.x}>Cancel</Text>
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
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4286f4',
    marginTop: 60,
  },
  containerBorder: {
    margin: 10,
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    margin: 15,
  },
  xButton: {
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginRight: 40,
      marginBottom: 6,
  },
  x: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 15,
  },
  textInputContainer: {
    marginLeft: 15,
    height: 120,
  },
  count: {
    marginLeft: 25,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: 'green',
    width: 60,
    borderRadius: 6,
  },
  doneText: {
    fontSize: 20,
    padding: 4,
    color: 'white',
  },
});
