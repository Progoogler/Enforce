import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import ImageModal from '../history/ImageModal';
import MapModal from '../history/MapModal';
import Unfound from './Unfound';

import {
  closeButtonSize,
  imageSize,
  pinHeight,
  pinWidth,
  primaryBlue,
  smallFontSize,
} from '../../styles/common';

/* global require */
export default class Result extends Component {
  constructor() {
    super();
    this.state = {
      showMaximizedImage: false,
      modalVisible: false,
      uri: '',
    }
  }

  render() {
    return (
      <View style={styles.outerContainer} >

        { this.state.showMaximizedImage ?
          <ImageModal
            uri={this.state.uri}
            visibility={this.state.showMaximizedImage}
            maximizeOrMinimizeImage={this.maximizeOrMinimizeImage.bind(this)} /> : null }

        {
          typeof this.props.data.data === 'object' ?
          <View style={styles.container}>
            <TouchableOpacity onPress={() => this.maximizeOrMinimizeImage(this.props.data.data.mediaUri)}>
              <Image source={{uri: this.props.data.data.mediaUri}} style={styles.image} />
            </TouchableOpacity>
              <View style={styles.dataContainer}>
                { 
                  this.props.data.data.license && this.props.data.data.VIN ?
                  <Text><Text style={styles.label}>License:</Text> {this.props.data.data.license + '         '}
                  <Text style={styles.label}>VIN:</Text> {this.props.data.data.VIN}</Text> 
                  :
                  <Text><Text style={styles.label}>License:</Text> {this.props.data.data.license}</Text> 
                }

                <Text><Text style={styles.label}>Photo taken:</Text> {this._getPrettyTimeFormat(this.props.data.data.createdAt)}</Text>
                { 
                  this.props.data.type === 'ticketed' ? 
                  <Text><Text style={styles.label}>Ticketed:</Text> {this._getPrettyTimeFormat(this.props.data.data.ticketedAt)}</Text> 
                  : 
                  <Text><Text style={styles.label}>Expired:</Text> {this._getPrettyTimeFormat(this.props.data.data.ticketedAt)}</Text> 
                }
                <Text><Text style={styles.label}>Time limit:</Text> {this._getTimeLimitDesc(this.props.data.data.timeLength)}</Text>
              </View>
              {
                this.props.data.data.latitude || this.props.data.data.description ?  
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => this._openMapPage()} >
                  <Image source={require('../../../../shared/images/blue-pin.png')} style={styles.mapIcon} />
                </TouchableOpacity>
                :
                null
              }
              <TouchableOpacity
                opacity={.8}
                style={styles.closeResultButton}
                onPress={() => this._handleCloseResult()} >
                <Text style={styles.closeResultText}>X</Text>
              </TouchableOpacity>
            </View>

            :

            <Unfound 
              deepSearch={this.props.deepSearch}
              license={this.props.license} 
              type={this.props.data}
            />

        }

        { this.state.modalVisible ? <MapModal
                                      visibility={this.state.modalVisible}
                                      latitude={this.props.data.data.latitude}
                                      longitude={this.props.data.data.longitude}
                                      description={this.props.data.data.description}
                                      closeModal={this.closeModal.bind(this)} /> : null }

      </View>
    );
  }

  _getTimeLimitDesc = (timeLimit: number): string => {
    if (timeLimit < 1) {
      return `${timeLimit * 60} minutes`;
    } else {
      return `${timeLimit} ${timeLimit === 1 ? 'hour' : 'hours'}`;
    }
  }

  _getPrettyTimeFormat = (createdAt: number): string => {
    let date = new Date(createdAt);
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    let str = date + '';
    str = str.slice(0, 10);
    return `${hour}:${minutes} ${period} ${str} `;
  }

  _openMapPage = () => {
    this.setState({modalVisible: true})
  }

  maximizeOrMinimizeImage(uri) {
    if (uri) {
      this.setState({showMaximizedImage: true, uri: uri});
    } else {
      this.setState({showMaximizedImage: false, uri: ''});
    }
  }

  _handleCloseResult() {
    this.props.minimizeResultContainer();
    this.props.resizeMenuContainer && this.props.resizeMenuContainer();
  }

  closeModal() {
    this.setState({modalVisible: false});
  }

}

Result.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  deepSearch: PropTypes.func.isRequired,
  license: PropTypes.string,
  minimizeResultContainer: PropTypes.func.isRequired,
  resizeMenuContainer: PropTypes.func,
};

const styles = StyleSheet.create({
  outerContainer: {
    height: 120,
    alignSelf: 'stretch',
    backgroundColor: primaryBlue,
    padding: '4%',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  image: {
    height: imageSize,
    width: imageSize,
    marginRight: '4%',
    flex: .3,
  },
  dataContainer: {
    flex: .7,
    padding: '1.5%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: smallFontSize,
  },
  mapButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  closeResultButton: {
    height: closeButtonSize,
    width: closeButtonSize,
    backgroundColor: primaryBlue,
  },
  closeResultText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  mapIcon: {
    height: pinHeight,
    width: pinWidth,
  },
});
 