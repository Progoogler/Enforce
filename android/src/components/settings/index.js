import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Switch,
  StyleSheet,
  AsyncStorage,
} from 'react-native';

import Header from '../home/Header';

export default class Settings extends Component {
  constructor() {
    super();
    this.state = {
      notifications: true,
      location: true,
      imageUpload: true,
      dataUpload: true,
      colorFalseSwitchIsOn: false,
    }
  }
  static navigationOptions = {
    drawerLabel: 'Settings',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../../../../shared/images/settings-icon.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation}/>
        <Text style={styles.title}>Settings</Text>


        <View style={styles.row}>
          <Text style={styles.settingDesc}>Show notifications when timers expire</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this.setState({notifications: value})}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor="#4286f4"
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
              thumbTintColor="#4286f4"
              tintColor="#808080"
              value={this.state.location} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Backup images to the cloud database</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this._imageUploadCondition(value)}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor="#4286f4"
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
              thumbTintColor="#4286f4"
              tintColor="#808080"
              value={this.state.dataUpload} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Hi</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this.setState({colorFalseSwitchIsOn: value})}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor="#4286f4"
              tintColor="#808080"
              value={this.state.colorFalseSwitchIsOn} />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.settingDesc}>Hi</Text>
          <View style={styles.slider}>
            <Switch
              onValueChange={(value) => this.setState({colorFalseSwitchIsOn: value})}
              onTintColor="green"
              style={{marginBottom: 10}}
              thumbTintColor="#4286f4"
              tintColor="#808080"
              value={this.state.colorFalseSwitchIsOn} />
          </View>
        </View>
     </View>
    );
  }

  async componentWillMount() {
    let settings = await AsyncStorage.getItem('@Enforce:settings');
    settings = JSON.parse(settings);
    this.setState({
      notications: settings.notifcations,
      location: settings.location,
      imageUpload: settings.imageUpload,
    });
  }

  componentWillUnmount() {
    let state = JSON.stringify(this.state);
    AsyncStorage.setItem('@Enforce:settings', state);
  }

  _toggleUploadCondition(boolean) {
    console.log('BOOLEAN', boolean)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    color: '#4286f4',
    fontSize: 34,
    marginTop: 40,
    marginBottom: 60,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  settingDesc: {
    marginLeft: 25,
    fontSize: 18,
  },
  slider: {
    marginRight: 25,
  }
});
