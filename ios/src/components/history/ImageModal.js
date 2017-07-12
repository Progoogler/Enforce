import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Modal,
  TouchableNativeFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import { primaryBlue, navigationBarHeight } from '../../styles/common';

/* global require */
export default class ImageModal extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"fade"}
        transparent={false}
        onRequestClose={() => this.props.maximizeImage()}
        visible={this.props.visibility} >
        <View style={styles.container}>
          <Image style={styles.image} source={{uri: this.props.uri}} />

          <View style={styles.buttonContainer}>
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple('white')}
              onPress={() => this.props.maximizeImage()} >
              <View style={styles.arrowContainer}>
                <Image style={styles.backArrow} source={require('../../../../shared/images/backarrow.jpg')} />
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      </Modal>
    );
  }

}

ImageModal.propTypes = {
  maximizeImage: PropTypes.func.isRequired,
  visibility: PropTypes.bool.isRequired,
  uri: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
  },
  buttonContainer: {
    backgroundColor: primaryBlue,
    alignSelf: 'stretch',
  },
  arrowContainer: {
    justifyContent: 'center',
    width: '100%',
    height: navigationBarHeight,
  },
  backArrow: {
    marginLeft: '6%',
  },
});
