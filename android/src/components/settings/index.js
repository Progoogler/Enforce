import React, { Component } from 'react';
import {
  AsyncStorage,
  Image,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import Navigation from '../navigation/StaticNavigation';
import {
  primaryBlue,
  smallFontSize,
  titleTextShadow,
  xxlargeFontSize,
} from '../../styles/common';

/* global require */
export default class Settings extends Component {
  constructor() {
    super();
    this.state = {
      dataUpload: true,
      imageUpload: false,
      imageRecognition: false,
      location: false,
      notifications: true,
    }
  }
  static navigationOptions = {
    drawerLabel: 'Settings',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/settings-icon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() { console.log('settings')
    return (
      <View style={styles.container}>
        <Navigation 
          navigation={this.props.navigation} 
          title={'Settings'}
        />
        <Text style={styles.title}>Control System</Text>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Show notifications when timers expire</Text>
          <View style={styles.slider}>
            <Switch
              onTintColor="green"
              onValueChange={(value) => this.setState({notifications: value})}
              style={{marginBottom: 10}}
              tintColor="#808080"
              thumbTintColor={primaryBlue}
              value={this.state.notifications} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Reminder to turn on GPS</Text>
          <View style={styles.slider}>
            <Switch
              onTintColor="green"
              onValueChange={(value) => this._toggleLocationReminder(value)}
              style={{marginBottom: 10}}
              tintColor="#808080"
              thumbTintColor={primaryBlue}
              value={this.state.location} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Use license recognition with camera</Text>
          <View style={styles.slider}>
            <Switch
              onTintColor="green"
              onValueChange={(value) => this._toggleImageRecognition(value)}
              style={{marginBottom: 10}}
              tintColor="#808080"
              thumbTintColor={primaryBlue}
              value={this.state.imageRecognition} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Backup images to the cloud database</Text>
          <View style={styles.slider}>
            <Switch
              onTintColor="green"
              onValueChange={(value) => this._imageUploadCondition(value)}
              style={{marginBottom: 10}}
              tintColor="#808080"
              thumbTintColor={primaryBlue}
              value={this.state.imageUpload} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Upload ticket information to cloud {'\n'} (Accessible for up to 45 days)</Text>
          <View style={styles.slider}>
            <Switch
              onTintColor="green"
              onValueChange={(value) => this._toggleUploadCondition(value)}
              style={{marginBottom: 10}}
              tintColor="#808080"
              thumbTintColor={primaryBlue}
              value={this.state.dataUpload} />
          </View>
        </View>

     </View>
    );
  }

  async componentWillMount() {
    this.settings = await AsyncStorage.getItem('@Enforce:settings');
    this.settings = JSON.parse(this.settings);
    this.setState({
      dataUpload: this.settings.dataUpload,
      imageRecognition: this.settings.imageRecognition,
      imageUpload: this.settings.imageUpload,
      location: this.settings.location,
      notifications: this.settings.notifications,
    });
  }

  componentWillUnmount() {
    let state = JSON.stringify(this.state);
    AsyncStorage.setItem('@Enforce:settings', state);
  }

  _toggleUploadCondition(boolean) {
    if (boolean) {
      this.setState({dataUpload: true});
      if (boolean !== this.settings.dataUpload) this.props.screenProps.updateDataUpload(true);
    } else {
      this.setState({dataUpload: false, imageUpload: false});
      if (boolean !== this.settings.dataUpload) this.props.screenProps.updateDataUpload(false);
      if (boolean !== this.settings.imageUpload) this.props.screenProps.updateImageUpload(false);
    }
  }

  _imageUploadCondition(boolean) {
    if (boolean) {
      if (!this.state.dataUpload) {
        this.setState({imageUpload: false});
        if (boolean !== this.settings.imageUpload) this.props.screenProps.updateImageUpload(false);
      } else {
        this.setState({imageUpload: true});
        if (boolean !== this.settings.imageUpload) this.props.screenProps.updateImageUpload(true);
      }
    } else {
      this.setState({imageUpload: false});
      if (boolean !== this.settings.imageUpload) this.props.screenProps.updateImageUpload(false);
    }
  }

  _toggleLocationReminder(boolean) {
    this.setState({location: boolean});
    if (boolean !== this.settings.location) this.props.screenProps.updateLocationReminder(boolean);
  }

  _toggleImageRecognition(boolean) {
    this.setState({imageRecognition: boolean});
    if (boolean !== this.settings.imageRecognition) this.props.screenProps.updateImageRecognition(boolean);
  }
}

Settings.propTypes = { 
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  title: {
    color: primaryBlue,
    textAlign: 'center',
    fontSize: xxlargeFontSize,
    fontWeight: 'bold',
    marginBottom: '10%',
    marginTop: '8%',
    textShadowColor: titleTextShadow,
    textShadowOffset: {
      height: 1,
      width: 1
    },
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '8%',
  },
  settingDesc: {
    fontSize: smallFontSize + 2,
    marginLeft: '6%',
  },
  slider: {
    marginRight: '6%',
  }
});
 