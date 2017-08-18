import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue, largeFontSize } from '../../styles/common';

const Done = (props) => (
  <TouchableOpacity
    activeOpacity={.5}
    style={styles.container}
    onPress={() => {props.navigation.navigate('Overview')}} >

    <Text style={styles.text}>Done</Text>

  </TouchableOpacity>
);

Done.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: primaryBlue,
    height: '6%',
    width: '20%',
    borderRadius: 20,
    marginBottom: '6%',
  },
  text: {
    padding: '2%',
    fontSize: largeFontSize,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Done;
