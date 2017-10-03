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
      imageUpload: true,
      imageRecognition: true,
      location: true,
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

  render() {
    return (
      <View style={styles.container}>
        <Navigation navigation={this.props.navigation} title={'Settings'} />
        <Text style={styles.title}>Control System</Text>


        <View style={styles.row}>
          <Text style={styles.settingDesc}>Show notifications when timers expire</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this.setState({notifications: value})}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor={primaryBlue}
              tintColor="#808080"
              value={this.state.notifications} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Reminder to turn on GPS</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this.setState({location: value})}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor={primaryBlue}
              tintColor="#808080"
              value={this.state.location} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Use license recognition with camera</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this.setState({imageRecognition: value})}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor={primaryBlue}
              tintColor="#808080"
              value={this.state.imageRecognition} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Backup images to the cloud database</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this._imageUploadCondition(value)}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor={primaryBlue}
              tintColor="#808080"
              value={this.state.imageUpload} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Upload ticket information to cloud {'\n'} (Accessible for up to 45 days)</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this._toggleUploadCondition(value)}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor={primaryBlue}
              tintColor="#808080"
              value={this.state.dataUpload} />
          </View>
        </View>

     </View>
    );
  }

  async componentWillMount() {
    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);
    this.setState({
      notifications: settings.notifications,
      location: settings.location,
      imageUpload: settings.imageUpload,
      dataUpload: settings.dataUpload,
      imageRecognition: settings.imageRecognition,
    });
  }

  componentWillUnmount() {
    let state = JSON.stringify(this.state);
    AsyncStorage.setItem('@Enforce:settings', state);
  }

  _toggleUploadCondition(boolean) {
    if (boolean) {
      this.setState({dataUpload: true});
    } else {
      this.setState({dataUpload: false, imageUpload: false});
    }
  }

  _imageUploadCondition(boolean) {
    if (boolean) {
      if (!this.state.dataUpload) {
        this.setState({imageUpload: false});
      } else {
        this.setState({imageUpload: true});
      }
    } else {
      this.setState({imageUpload: false});
    }
  }
}

Settings.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    color: primaryBlue,
    fontSize: xxlargeFontSize,
    marginTop: '8%',
    marginBottom: '10%',
    fontWeight: 'bold',
    textShadowColor: titleTextShadow,
    textShadowOffset: {
      width: 1,
      height: 1
    },
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '8%',
  },
  settingDesc: {
    marginLeft: '6%',
    fontSize: smallFontSize + 2,
  },
  slider: {
    marginRight: '6%',
  }
});
