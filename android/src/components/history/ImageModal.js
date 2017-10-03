import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import Navigation from '../navigation/StaticNavigation';
import PhotoView from 'react-native-photo-view';
import PropTypes from 'prop-types';

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
