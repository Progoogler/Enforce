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

  render() { console.log('location renders')
    return (
      <Modal animationType={'slide'}
        onRequestClose={() => this.props.setModalVisible(this.state.text)} 
        transparent={true}
        visible={this.props.visibility}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Location Reminder</Text>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.textInputContainer}>
            <AutoGrowingTextInput
              autoCapitalize={'sentences'}
              autoCorrect={false}
              autoFocus={true}
              fontSize={26}
              maxLength={75}
              minHeight={120}
              onChange={(event) => this._handleTextInput(event)}
              style={styles.textInput}
              underlineColorAndroid={primaryBlue}
              value={this.state.text} 
            />
            <Text style={styles.count}>{75 - this.state.text.length} characters remaining</Text>
          </View>
        </View>
            
        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={.9}
            onPress={() => {
              this.setState({text: ''});
              this.props.setModalVisible('');
            }}
            style={styles.buttonColumn}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.separator}/>
          <TouchableOpacity
            activeOpacity={.9}
            onPress={() => {
              this.props.setModalVisible(this.state.text);
              this.setState({text: ''});
            }} 
            style={styles.buttonColumn}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.visibility !== nextProps.visibility) return true;
    return false;
  }

  _handleTextInput(event) {
    this.setState({ text: event.nativeEvent.text || '' });
  }
}

LocationInput.propTypes = {
  setModalVisible: PropTypes.func.isRequired,
  visibility: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  buttonColumn: {
    alignItems: 'center',
    backgroundColor: primaryBlue,
    borderColor: 'white',
    borderTopWidth: 1,
    flex: .5,
    height: mainButtonsHeight,
    justifyContent: 'center',
  },
  buttonRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelText: {
    color: 'white',
    fontSize: mediumFontSize,
  },
  count: {
    alignSelf: 'flex-end',
    color: 'white',
    marginRight: '2%',
    marginBottom: '2%',
  },
  doneText: {
    color: 'white',
    fontSize: mediumFontSize,
  },
  textContainer: {
    alignSelf: 'stretch',
    backgroundColor: primaryBlue,
  },
  textInput: {
    color: 'white',
  },
  textInputContainer: {
    height: textInputContainerHeight,
    marginLeft: '5%',
    marginRight: '5%',
  },
  title: {
    color: primaryBlue,
    fontSize: largeFontSize,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: '5%',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
    height: mainButtonsHeight,
  },
});
