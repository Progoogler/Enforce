import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { mediumFontSize, primaryBlue, timeLimitTitleContainerHeight } from '../../styles/common';


class Title extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <TouchableWithoutFeedback onPress={this.props.getDirectionBound}>
        <View style={styles.container}>
          <Text style={styles.text}>{this._getTimeLimitResponse(this.props.limit)} Queue {this.props.bound ? ` [ ${this.props.bound} ]` : ''}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _getTimeLimitResponse(length) {
    if (length === 0) return 'Empty ';
    if (length < 1) {
      length = length * 60;
      return `${parseInt(length)}  Minute`;
    } else {
      return `${parseFloat(length.toFixed(1))}  Hour`;
    }
  }

}
 
Title.propTypes = { 
  getDirectionBound: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  container: {
    height: timeLimitTitleContainerHeight,  //40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: primaryBlue,
    marginTop: '-1%',
  },
  text: {
    fontSize: mediumFontSize,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'grey',
    textShadowOffset: {
      width: 1,
      height: 1
    },
  },
});

export default Title;
