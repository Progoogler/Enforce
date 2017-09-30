import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import PhotoView from 'react-native-photo-view';
import Navigation from '../navigation/StaticNavigation';
import { primaryBlue, navBarContainerHeight } from '../../styles/common';

/* global require */
export default class ImageModal extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"fade"}
        transparent={false}
        onRequestClose={() => this.props.maximizeOrMinimizeImage()}
        visible={this.props.visibility} >
        <View style={styles.container}>
          <Navigation title={'Enforce'} closeModal={this.props.maximizeOrMinimizeImage} />
          <PhotoView style={styles.image}
            source={{uri: this.props.uri}}
            androidScaleType="fitXY"
            />
        </View>
      </Modal>
    );
  }
}

ImageModal.propTypes = {
  maximizeOrMinimizeImage: PropTypes.func.isRequired,
  visibility: PropTypes.bool.isRequired,
  uri: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
});
