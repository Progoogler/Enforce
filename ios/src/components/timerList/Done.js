import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

const Done = (props) => (
  <TouchableOpacity
    activeOpacity={.5}
    style={styles.container}
    onPress={() => {props.navigation.navigate('Overview')}}
    underlayColor="#0055e1" >

    <Text style={styles.text}>Done</Text>

  </TouchableOpacity>
);

Done.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#4286f4',
    height: 80,
    width: 100,
    borderRadius: 10,
    marginBottom: 18,
  },
  text: {
    padding: 5,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Done;
