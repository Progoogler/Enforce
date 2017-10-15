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
  
  shouldComponentUpdate(nextProps) {
    if (this.props.bound !== nextProps.bound) return true;
    if (this.props.limit !== nextProps.limit) return true;
    return false;
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
    alignItems: 'center',
    backgroundColor: primaryBlue,
    height: timeLimitTitleContainerHeight,  //40,
    justifyContent: 'center',
    marginTop: '-1%',
  },
  text: {
    color: 'white',
    fontSize: mediumFontSize,
    fontWeight: 'bold',
    textShadowColor: 'grey',
    textShadowOffset: {
      height: 1,
      width: 1
    },
  },
});

export default Title;
