import React from 'react';
import {
  View,
  Text,
  Image,
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

    <View style={styles.row}>
      <Image
        source={require('../../../../shared/images/checkmark.jpg')}
        style={styles.image}
        />
      <Text style={styles.text}>Done</Text>
    </View>

  </TouchableOpacity>
);

Done.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    bottom: 0,
    zIndex: 10,
    borderTopWidth: 2,
    borderColor: primaryBlue,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    padding: '5%',
    fontSize: largeFontSize,
    color: primaryBlue,
  }
});

// container: {
//   justifyContent: 'center',
//   alignItems: 'center',
//   alignSelf: 'center',
//   backgroundColor: primaryBlue,
//   height: '6%',
//   width: '20%',
//   borderRadius: 20,
//   marginBottom: '6%',
// },
// text: {
//   padding: '2%',
//   fontSize: largeFontSize,
//   color: 'white',
//   fontWeight: 'bold',
// },

export default Done;
