import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  ActivityIndicator,
  AsyncStorage,
  NetInfo,
} from 'react-native';
import PropTypes from 'prop-types';
import Firebase from '../../../../includes/firebase/firebase';
import Database from '../../../../includes/firebase/database';

import Navigation from '../navigation/StaticNavigation';
import Warning from './Warning';
import ThrowConnectionMessage from './ThrowConnectionMessage';

import {
  primaryBlue,
  titleTextShadow,
  xxlargeFontSize,
  largeFontSize,
  mediumFontSize,
  textInputWidth,
} from '../../styles/common';

/* global require */
export default class Profile extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      county: '',
      emailColor: 'black',
      passwordColor: 'black',
      countyColor: 'black',
      emailBackground: 'white',
      passwordBackground: 'white',
      countyBackground: 'white',
      emailWarning: false,
      passwordWarning: false,
      profileStatus: 'Create Profile',
      animating: false,
      isConnected: true,
    };
    this.profile = {};
    this.profileId = '';
    this.createdNewUser = false;
    this.replacedOldUser = false;
    this._mounted = true;
  }
  static navigationOptions = {
    drawerLabel: 'Profile',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/person-icon.png')} />
    )
  };

  render() {
    return (
      <View style={styles.container} behavior={'padding'}>
        <Navigation navigation={this.props.navigation} title={'Profile'} />
        <Text style={styles.title}>Account Settings</Text>

          <View style={styles.row}>

            <TextInput
              style={{ backgroundColor: this.state.emailBackground, borderColor: this.state.emailColor, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}
              autoCorrect={false}
              autoCapitalize={'words'}
              keyboardType={'email-address'}
              placeholder={'Email'}
              fontSize={mediumFontSize}
              underlineColorAndroid={'transparent'}
              onFocus={() => this._onEmailFocus()}
              onBlur={() => this._onEmailBlur()}
              onChangeText={(text) => { this.setState({ email: text })}}
              value={this.state.email} />
          </View>

          { this.state.emailWarning ? <Warning warning={'Enter valid email address'} /> : null }

          <View style={styles.row}>

            <TextInput
              style={{ backgroundColor: this.state.passwordBackground, borderColor: this.state.passwordColor, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}
              autoCorrect={false}
              secureTextEntry={true}
              fontSize={mediumFontSize}
              placeholder={'Password'}
              underlineColorAndroid={'transparent'}
              onFocus={() => this._onPasswordFocus()}
              onBlur={() => this._onPasswordBlur()}
              onChangeText={(text) => this._onPasswordChangeText(text)}
              value={this.state.password} />
          </View>

          { this.state.passwordWarning ? <Warning warning={'Must be at least 6 characters'} /> : null }

          <View style={styles.row}>

            <TextInput
              style={{ backgroundColor: this.state.countyBackground, borderColor: this.state.countyColor, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}
              autoCorrect={false}
              autoCapitalize={'words'}
              fontSize={mediumFontSize}
              placeholder={'County'}
              underlineColorAndroid={'transparent'}
              onFocus={() => this._onCountyFocus()}
              onBlur={() => this._onCountyBlur()}
              onChangeText={(text) => { this.setState({ county: text })}}
              value={this.state.county} />
          </View>

        <TouchableHighlight
          style={styles.button}
          underlayColor='green'
          onPress={() => this._setNewProfile() }>
          <Text style={styles.buttonText}>{ this.state.profileStatus }</Text>
        </TouchableHighlight>

        { this.state.isConnected ? null : <ThrowConnectionMessage /> }
        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' />
      </View>
    );
  }

  componentWillMount() {
    this._mounted = true;
    this._getProfileFromAsyncStorage();
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.createdNewUser) {
      Firebase.signInUser(this.state.email, this.state.password);
      setTimeout(() => {
        let id = Firebase.getCurrentUser();
        let refPath = `${this.state.county}/${id}`;
        AsyncStorage.setItem('@Enforce:refPath', refPath);
        AsyncStorage.setItem('@Enforce:profileId', id);
      }, 1500);
      return;
    }
    if (this.replacedOldUser) {
      Database.deleteUserTickets(this.profile.county, this.profileId);
      Firebase.signInUser(this.state.email, this.state.password);
      setTimeout(() => {
        let newId = Firebase.getCurrentUser();
        let refPath = `${this.state.county}/${newId}`;
        AsyncStorage.setItem('@Enforce:refPath', refPath);
        AsyncStorage.setItem('@Enforce:profileId', newId);
        Database.transferUserData(this.state.county, newId, this.data); // Port old data into new account
      }, 1500);
    }
  }

  async _getProfileFromAsyncStorage() {
    try {
      this.profile = await AsyncStorage.getItem('@Enforce:profileSettings');
      this.profile = JSON.parse(this.profile);
      this.profile && this.setState({
        email: this.profile.email ? this.profile.email : '',
        password: this.profile.password ? this.profile.password : '',
        county: this.profile.county ? this.profile.county : '',
      });
      this.profileId = await AsyncStorage.getItem('@Enforce:profileId');
      this.profileId && Firebase.signInUser(this.profile.email, this.profile.password);
    } catch (err) {
      console.warn('Error fetching Profile Settings from AsyncStorage', err);
    }
  }

  async _setNewProfile() {
    if (this.state.emailWarning || this.state.passwordWarning) return;
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this.setState({animating: true, profileStatus: 'Creating Profile', isConnected: true});
        setTimeout(() => {
          this._mounted && this.setState({animating: false, profileStatus: 'Create Profile'});
        }, 3000);
        let settings = {
          email: this.state.email,
          password: this.state.password,
          county: this.state.county,
        };
        settings = JSON.stringify(settings);
        if (!this.profileId) { // Create first new account.
          Firebase.signInUser(this.state.email, this.state.password, (errorResponse) => {
            // If this account exists in Firebase, just sign in.
            if (errorResponse) {
              // Otherwise create a new user
              Firebase.createNewUser(this.state.email, this.state.password);
            }
          });
          AsyncStorage.setItem('@Enforce:profileSettings', settings);
          this.createdNewUser = true;
          return;
        }
        try { // Replace old account.

          // Only changing user password.
          if (this.profile.password !== this.state.password && this.profile.email === this.state.email && this.profile.county === this.state.county) {
            Firebase.changeUserPassword(this.state.password);
            AsyncStorage.setItem('@Enforce:profileSettings', settings);
            return;
          }

          // Change Firebase account if either email or county IDs change.
          if (this.profile.email !== this.state.email || this.profile.county !== this.state.county) {

            // TODO Check if user wants to retain old records first
            Database.getUserTickets(this.profile.county, this.profileId, (data) => {
              // Gather all the data on current account to ready for port.
              this.data = data;
              Firebase.deleteUser();
            });


            AsyncStorage.setItem('@Enforce:profileSettings', settings);

            Firebase.createNewUser(this.state.email, this.state.password);

            this.replacedOldUser = true;
          }
        } catch (err) {
          console.warn('Error updating profile setting', err);
        }
      } else {
        this.setState({isConnected: false});
        setTimeout(() => {
          this._mounted && this.setState({isConnected: true});
        }, 5000);
      }
    });
  }

  _onEmailFocus() {
    this.setState({emailColor: primaryBlue, emailBackground: '#e8eae9'});
  }

  _onEmailBlur() {
    let email = this.state.email;
    let regexForCom = /.(?=\.com$)/g;
    let regexForAt = /@{1}/g;
    let com = regexForCom.test(email);
    let at = regexForAt.test(email);
    if (!com || !at) {
      this.setState({emailColor: 'red', emailWarning: true, emailBackground: 'white'});
      return;
    }
    this.setState({emailColor: 'black', emailWarning: false, emailBackground: 'white'});
  }

  _onPasswordChangeText(text) {
    if (this.state.passwordWarning && text.length >= 6) {
      this.setState({passwordWarning: false, password: text});
      return;
    }
    this.setState({password: text});
  }

  _onPasswordFocus() {
    this.setState({passwordColor: primaryBlue, passwordBackground: '#e8eae9'});
  }

  _onPasswordBlur() {
    if (this.state.password.length < 6) {
      this.setState({passwordColor: 'red', passwordWarning: true, passwordBackground: 'white'});
      return;
    }
    this.setState({passwordColor: 'black', passwordWarning: false, passwordBackground: 'white'});
  }

  _onCountyFocus() {
    this.setState({countyColor: primaryBlue, countyBackground: '#e8eae9'});
  }

  _onCountyBlur() {
    this.setState({countyColor: 'black', countyBackground: 'white'});
  }
}

Profile.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
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
    margin: '4%',
  },
  button: {
    width: '50%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '30%',
    padding: '4%',
    borderRadius: 10,
    backgroundColor: primaryBlue,
  },
  buttonText: {
    fontSize: largeFontSize,
    color: 'white',
  },
  activity: {
    position: 'absolute',
    bottom: '2%',
    alignSelf: 'center',
  },
});
