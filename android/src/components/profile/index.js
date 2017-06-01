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
import Firebase from '../../../../includes/firebase/firebase';
import Database from '../../../../includes/firebase/database';

import Header from '../home/Header';

export default class Profile extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      state: '',
      emailColor: 'black',
      passwordColor: 'black',
      stateColor: 'black',
    };
    this.profile = {};
    this.profileId = '';
  }

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />
        <Text style={styles.title}>Profile Settings</Text>
        <View style={styles.row} >
          <Text style={styles.designator}>Email</Text>
          <TextInput
            style={{ borderColor: this.state.emailColor, borderWidth: 1, width: 220, paddingLeft: 15, position: 'absolute', right: 0 }}
            autoCorrect={false}
            autoCapitalize={'words'}
            fontSize={18}
            underlineColorAndroid={'transparent'}
            onFocus={() => this._onEmailFocus()}
            onBlur={() => this._onEmailBlur()}
            onChangeText={(text) => { this.setState({ email: text })}}
            value={this.state.email} />
        </View>
        <View style={styles.row} >
          <Text style={styles.designator}>Password</Text>
          <TextInput
            style={{ borderColor: this.state.passwordColor, borderWidth: 1, width: 220, paddingLeft: 15, position: 'absolute', right: 0 }}
            autoCorrect={false}
            secureTextEntry={true}
            fontSize={18}
            underlineColorAndroid={'transparent'}
            onFocus={() => this._onPasswordFocus()}
            onBlur={() => this._onPasswordBlur()}
            onChangeText={(text) => { this.setState({ password: text })}}
            value={this.state.password} />
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
          onPress={() => this._setNewProfile() }>
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
      this.profile = await AsyncStorage.getItem('@Enforce:profileSettings');
      console.log('parse', JSON.parse(this.profile))
      this.profile = JSON.parse(this.profile);
      this.setState({
        email: this.profile.email ? this.profile.email : '',
        password: this.profile.password ? this.profile.password : '',
        state: this.profile.state ? this.profile.state : '',
      });
      this.profileId = await AsyncStorage.getItem('@Enforce:profileId');
      console.log('get profile id', this.profileId)
      // Potentially sign in after component mounts for change updates to password
      //
      //
      // let id = Firebase.getCurrentUser();
      // AsyncStorage.setItem('@Enforce:profileId', id);
      // this.profileId = '';
    } catch (err) {
      console.warn('Error fetching Profile Settings from AsyncStorage', err);
    }
  }

  async _setNewProfile() {
    let settings = {
      email: this.state.email,
      password: this.state.password,
      state: this.state.state,
    };
    settings = JSON.stringify(settings);
    if (!this.profileId) { console.log('no profile id')
      await AsyncStorage.setItem('@Enforce:profileSettings', settings);
      await Firebase.createNewUser(this.state.email, this.state.password);
      Firebase.signInUser(this.state.email, this.state.password);
      setTimeout(() => {
        let id = Firebase.getCurrentUser();
        AsyncStorage.setItem('@Enforce:profileId', id);
      }, 5000);
      return;
    }
    try {
      console.log('try setting new user')
      if (this.profile.email !== this.state.email || this.profile.password !== this.state.password || this.profile.state !== this.state.state) {
        AsyncStorage.setItem('@Enforce:profileSettings', settings);
        console.log('try set item to asyncStore')
        // create new user, port old data, and delete old db user
        await Firebase.createNewUser(this.state.email, this.state.password);
        console.log('try created new user')
        let data = await Database.getUserTickets(this.profileId);
        console.log('get data from db', data)
        Firebase.deleteUser();

        setTimeout(() => {
          Firebase.signInUser(this.state.email, this.state.password);
          let newId = Firebase.getCurrentUser();
          Database.transferUserData(newId, data);
        }, 5000);
      }
    } catch (err) {
      console.warn('Error updating profile setting on AsyncStorage', err);
    }
  }

  _onEmailFocus() {
    this.setState({nameColor: '#4286f4'});
  }

  _onEmailBlur() {
    let email = this.state.email;
    let regexForCom = /.(?=com$)/g;
    let regexForAt = /@{1}/g;
    let com = regexForCom.test(email);
    let at = regexForAt.test(email);
    if (!com || !at) {
      this.setState({emailColor: 'red'});
      return;
    }
    this.setState({emailColor: 'black'});
  }

  _onPasswordFocus() {
    this.setState({passwordColor: '#4286f4'});
  }

  _onPasswordBlur() {
    if (this.state.password.length < 6) {
      this.setState({passwordColor: 'red'});
      return;
    }
    this.setState({passwordColor: 'black'});
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
