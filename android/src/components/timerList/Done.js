import React from 'react';
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
} from '../../styles/common';

const Done = (props) => (
  <TouchableOpacity
    activeOpacity={.5}
    style={styles.container}
    onPress={() => {
      if (props.closeModal) {
        props.closeModal();
      } else {
        props.navigation.navigate('Overview');
      }
    }}
  >
      <Image
        source={require('../../../../shared/images/checkmark.jpg')}
        style={styles.image}
      />
      <Text style={styles.text}>{props.text ? props.text : 'Done'}</Text>

  </TouchableOpacity>
);

Done.propTypes = { 
  closeModal: PropTypes.func,
  navigation: PropTypes.object,
  text: PropTypes.string,
 };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: doneHeight,
    width: '100%',
    bottom: 0,
    zIndex: 10,
    borderTopWidth: 2,
    borderColor: primaryBlue,
  },
  text: {
    padding: '5%',
    fontSize: largeFontSize,
    color: primaryBlue,
  }
});

export default Done;
