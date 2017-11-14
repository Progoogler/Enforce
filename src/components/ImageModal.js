import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import Navigation from './StaticNavigation';
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
        onRequestClose={() => this.props.maximizeOrMinimizeImage()}
        transparent={false}
        visible={this.props.visibility} 
      >
        <View style={styles.container}>
          <Navigation 
            closeModal={this.props.maximizeOrMinimizeImage}
            title={'Enforce'} 
          />
          <PhotoView style={styles.image}
            androidScaleType="fitXY"
            source={{uri: this.props.uri}}
          />
        </View>
      </Modal>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.visibility !== nextProps.visibility) return true;
    return false;
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
