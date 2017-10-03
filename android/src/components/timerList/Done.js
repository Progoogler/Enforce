import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { largeFontSize, primaryBlue } from '../../styles/common';

const Done = (props) => (
  <TouchableOpacity
    activeOpacity={.5}
    style={styles.container}
    onPress={() => {props.navigation.navigate('Overview')}} >

      <Image
        source={require('../../../../shared/images/checkmark.jpg')}
        style={styles.image}
      />
      <Text style={styles.text}>Done</Text>

  </TouchableOpacity>
);

Done.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
