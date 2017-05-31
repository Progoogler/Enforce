import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  AsyncStorage,
} from 'react-native';

import Header from '../home/Header';

export default class Profile extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      badge: '',
      state: '',
      nameColor: 'black',
      badgeColor: 'black',
      stateColor: 'black',
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />
        <Text style={styles.title}>Profile Settings</Text>
        <View style={styles.row} >
          <Text style={styles.designator}>First Name</Text>
          <TextInput
            style={{ borderColor: this.state.nameColor, borderWidth: 1, width: 220, paddingLeft: 15, position: 'absolute', right: 0 }}
            autoCorrect={false}
            autoCapitalize={'words'}
            fontSize={18}
            underlineColorAndroid={'transparent'}
            onFocus={() => this._onNameFocus()}
            onBlur={() => this._onNameBlur()}
            onChangeText={(text) => { this.setState({ name: text })}}
            value={this.state.name} />
        </View>
        <View style={styles.row} >
          <Text style={styles.designator}>Badge</Text>
          <TextInput
            style={{ borderColor: this.state.badgeColor, borderWidth: 1, width: 220, paddingLeft: 15, position: 'absolute', right: 0 }}
            autoCorrect={false}
            keyboardType={'numeric'}
            fontSize={18}
            underlineColorAndroid={'transparent'}
            onFocus={() => this._onBadgeFocus()}
            onBlur={() => this._onBadgeBlur()}
            onChangeText={(text) => { this.setState({ badge: text })}}
            value={this.state.badge} />
        </View>
        <View style={styles.row} >
          <Text style={styles.designator}>State</Text>
          <TextInput
            style={{ borderColor: this.state.stateColor, borderWidth: 1, width: 220, paddingLeft: 15, position: 'absolute', right: 0 }}
            autoCorrect={false}
            autoCapitalize={'characters'}
            fontSize={18}
            underlineColorAndroid={'transparent'}
            onFocus={() => this._onStateFocus()}
            onBlur={() => this._onStateBlur()}
            onChangeText={(text) => { this.setState({ state: text })}}
            value={this.state.state} />
        </View>
        <TouchableHighlight
          style={styles.button}
          underlayColor='green'
          onPress={() => {}} >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableHighlight>
      </View>
    );
  }

  componentWillMount() {
    this._getProfileFromAsyncStorage();
  }

  async _getProfileFromAsyncStorage() {
    try {
      let profile = await JSON.parse(AsyncStorage.getItem('@Enforce:profileSettings'));
      this.setState({
        name: profile.name ? profile.name : '',
        badge: profile.badge ? profile.badge : '',
        state: profile.state ? profile.state : '',
      });
    } catch (err) {
      console.warn('Error fetching Profile Settings from AsyncStorage', err);
    }
  }

  async _setProfileToAsyncStorage() {
    try {
      await AsyncStorage.setItem('@Enforce:profileSettings', JSON.stringify(this.state));
    } catch (err) {
      console.warn('Error updating profile setting on AsyncStorage', err);
    }
  }

  _onNameFocus() {
    this.setState({nameColor: '#4286f4'});
  }

  _onNameBlur() {
    this.setState({nameColor: 'black'});
  }

  _onBadgeFocus() {
    this.setState({badgeColor: '#4286f4'});
  }

  _onBadgeBlur() {
    this.setState({badgeColor: 'black'});
  }

  _onStateFocus() {
    this.setState({stateColor: '#4286f4'});
  }

  _onStateBlur() {
    this.setState({stateColor: 'black'});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    color: '#4286f4',
    marginTop: 30,
    marginBottom: 30,
    fontSize: 34,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    margin: 25,

  },
  designator: {
    fontSize: 20,
    marginLeft: 25,
    marginTop: 15,
    fontWeight: 'bold',
  },
  button: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 60,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#4286f4',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
});
