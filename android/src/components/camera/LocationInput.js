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
  mainButtonsHeight,
  mediumFontSize,
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

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Location Reminder</Text>
          </View>

          <View style={styles.textContainer}>
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
                value={this.state.text} 
              />
              <Text style={styles.count}>{75 - this.state.text.length} characters remaining</Text>
            </View>
          </View>
              
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonColumn}
              activeOpacity={.9}
              onPress={() => {
                this.setState({text: ''});
                this.props.setModalVisible('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.separator}/>
            <TouchableOpacity
              style={styles.buttonColumn}
              activeOpacity={.9}
              onPress={() => {
                this.props.setModalVisible(this.state.text);
                this.setState({text: ''});
              }} 
            >
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
    // backgroundColor: primaryBlue,
    // marginTop: navigationBarHeight,
    // padding: '5%',
    // flex: 1,
  },
  titleContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: '5%',
  },
  title: {
    color: primaryBlue,
    fontSize: largeFontSize,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textContainer: {
    alignSelf: 'stretch',
    backgroundColor: primaryBlue,
  },
  textInputContainer: {
    marginLeft: '5%',
    marginRight: '5%',
    // borderRadius: 10,
    height: textInputContainerHeight,
  },
  textInput: {
    color: 'white',
  },
  count: {
    alignSelf: 'flex-end',
    color: 'white',
    marginRight: '2%',
    // marginTop: '2%',
    marginBottom: '2%',
  },
  buttonRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonColumn: {
    alignItems: 'center',
    backgroundColor: primaryBlue,
    borderColor: 'white',
    borderTopWidth: 1,
    flex: .5,
    height: mainButtonsHeight,
    justifyContent: 'center',
  },
  cancelText: {
    color: 'white',
    fontSize: mediumFontSize,
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
    height: mainButtonsHeight,
  },
  doneText: {
    color: 'white',
    fontSize: mediumFontSize,
  },
});
