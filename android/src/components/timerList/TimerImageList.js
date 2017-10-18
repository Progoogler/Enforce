import React, { Component } from 'react';
import {
  NetInfo,
  StyleSheet,
  View,
} from 'react-native';
import FlatList from 'react-native/Libraries/Lists/FlatList';
import PropTypes from 'prop-types';

import Row from './Row';  
import { timerFlatListHeight } from '../../styles/common';


export default class TimerImageList extends Component {
  constructor() {
    super();
    this.currentLicense = 0;
    this.decipherUploadSetting = this.decipherUploadSetting.bind(this);
    // These variables are used to calculate the index of the Timer currently in the scroll view
    this.flatListHeight = Math.ceil(timerFlatListHeight);
    this.halvedFlatListHeight = Math.ceil(timerFlatListHeight / 2);
    this.handleScroll = this.handleScroll.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.state = {
      upload: true
    };
  }

  render() {
    return (
      <FlatList
        data={this.props.data}
        getItemLayout={this._itemLayout}
        ItemSeparatorComponent={this._renderSeparator}
        initialNumToRender={2}
        keyExtractor={this._keyExtractor}
        onRefresh={this.props.onRefresh}
        onScroll={this.handleScroll}
        refreshing={this.props.refreshing}
        removeClippedSubviews={true}
        renderItem={this.renderItem}
        reset={this.props.reset}
      />
    );
  }

  componentDidMount() {
    this.decipherUploadSetting();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.upload !== nextState.upload) return true;
    if (this.props.reset !== nextProps.reset) return true;
    return false;
  }

  renderItem(data: object): object {
    return (
      <Row
        data={data.item}
        decipherUploadSetting={this.decipherUploadSetting}
        expiredFunc={this.props.expiredFunc}
        uponTicketed={this.props.uponTicketed}
        enterLicenseInSearchField={this.props.enterLicenseInSearchField}
        navigation={this.props.navigation}
        upload={this.state.upload}
        uploadImage={this.props.uploadImage}
      />
    );
  }

  _renderSeparator() {
    return <View style={styles.separator}/>;
  }

  _keyExtractor(item: object = {'createdAt': 0}): number {
    return item.createdAt;
  }

  _itemLayout(data, index) {
    return {offset: timerFlatListHeight + StyleSheet.hairlineWidth + 4.5 * index, length: timerFlatListHeight + StyleSheet.hairlineWidth + 4.5, index};
  }

  handleScroll(event) {
    // Update the license value of the current timer on the FlatList view to the search input field as user scrolls
    if (this.props.imageRecognition) {
      if (event.nativeEvent.contentOffset.y > this.halvedFlatListHeight) {
        let idx = Math.ceil(event.nativeEvent.contentOffset.y / this.flatListHeight);
        if (idx !== this.currentLicense) {
          if (this.props.data[idx] === undefined) return;
          this.currentLicense = idx;
          this.props.enterLicenseInSearchField({
            license: this.props.data[idx].license,
            timerIndex: idx,
          });
        }
      } else if (this.currentLicense !== 0) {
        this.currentLicense = 0;
        this.props.enterLicenseInSearchField({
          license: this.props.data[0].license,
          timerIndex: 0,
        });
      }
    }
  }

  decipherUploadSetting() {
    if (this.props.dataUpload) {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected) {
          if (!this.state.upload) {
            this.setState({upload: true});
            setTimeout(() => this.onRefresh(), 1000);
          }
        } else {
          this.setState({upload: false});
        }
      });
    }
  }
}

TimerImageList.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  dataUpload: PropTypes.bool.isRequired,
  enterLicenseInSearchField: PropTypes.func.isRequired,
  expiredFunc: PropTypes.func.isRequired,
  imageRecognition: PropTypes.bool.isRequired,
  navigation: PropTypes.object.isRequired,
  onRefresh: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
  uponTicketed: PropTypes.func.isRequired,
  refreshing: PropTypes.bool.isRequired,
  reset: PropTypes.number.isRequired,
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: '#8E8E8E',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
