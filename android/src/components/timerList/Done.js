import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { 
  doneHeight,
  largeFontSize, 
  primaryBlue, 
  mediumFontSize,
} from '../../styles/common';

export default class Done extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <TouchableOpacity
        activeOpacity={.5}
        onPress={() => this._handlePress()}
        style={styles.container}
      >
        {
          this.props.text === 'Send' ?
          <Image source={require('../../../../shared/images/envelope.png')}/> 
          :
          this.props.text ?
          <Image source={require('../../../../shared/images/internet-icon.png')}/> 
          :
          <Image source={require('../../../../shared/images/checkmark.jpg')}/>
        }
        <Text style={[styles.text, this.props.text === 'Must be connected to the Internet' ? styles.smallText : null]}>{this.props.text ? this.props.text : 'Done'}</Text>
      </TouchableOpacity>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.text !== nextProps.text) return true;
    return false;
  }

  _handlePress() {
    if (this.props.closeModal) {
      this.props.closeModal();
    } else {
      this.props.navigation.navigate('Overview');
    }
  }

}

Done.propTypes = { 
  closeModal: PropTypes.func,
  navigation: PropTypes.object,
  text: PropTypes.string,
 };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: primaryBlue,
    borderTopWidth: 2,
    bottom: 0,
    flexDirection: 'row',
    height: doneHeight,
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
  },
  text: {
    color: primaryBlue,
    fontSize: largeFontSize,
    padding: '5%',
  },
  smallText: {
    color: primaryBlue,
    fontSize: mediumFontSize,
    padding: '5%',
  }
});
