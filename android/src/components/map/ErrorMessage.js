import React, { Component } from 'react';
import {
  Animated,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { mediumFontSize, navBarContainerHeight, primaryBlue } from '../../styles/common';
 
class ErrorMessage extends Component {
  constructor() {
    super();
    this.messageBottom = new Animated.Value(-navBarContainerHeight);
  }
  render() {
    return (
      <Animated.View
        style={{
          bottom: this.messageBottom,
          position: 'absolute',
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.showError === false) {
      this.hideErrorMessage();
    } else if (nextProps.showError) {
      Animated.timing(
        this.messageBottom, { 
          toValue: 0,
          duration: 1000 
        }
      ).start();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.showError !== nextProps.showError) return true;
    return false;
  }

  hideErrorMessage() {
    Animated.timing(
      this.messageBottom, { 
        toValue: -navBarContainerHeight,
        duration: 1000 
      }
    ).start();
  }
}

ErrorMessage.propTypes = {
  checkLocationAndRender: PropTypes.func.isRequired,
  showError: PropTypes.bool.isRequired,
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: primaryBlue,
    borderTopWidth: 2,
    height: navBarContainerHeight,
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
  },
  message: {
    fontSize: mediumFontSize,
  },
  again: {
    color: primaryBlue,
  },
});

export default ErrorMessage;
