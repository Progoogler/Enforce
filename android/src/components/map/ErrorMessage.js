import React, { Component } from 'react';
import {
  Animated,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { mediumFontSize, primaryBlue } from '../../styles/common';
 
class ErrorMessage extends Component {
  constructor() {
    super();
    this.messageBottom = new Animated.Value(-30);
  }
  render() {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: this.messageBottom,
        }}
      >
        <TouchableWithoutFeedback onPress={() => this.props.checkLocationAndRender()}>
          <View style={styles.container}>
            <Text style={styles.message}> Location not accessible. Please try <Text style={styles.again}>again.</Text></Text>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  componentDidMount() {
    Animated.timing(
      this.messageBottom,
      { toValue: 0,
        duration: 1000 }
    ).start();
  }
}

ErrorMessage.propTypes = {
  checkLocationAndRender: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    padding: '4%',
    zIndex: 10,
    borderTopWidth: 2,
    borderColor: primaryBlue,
  },
  message: {
    fontSize: mediumFontSize,
  },
  again: {
    color: primaryBlue,
  },
});

export default ErrorMessage;
