import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  Keyboard,
  NetInfo,
  View,
  Text,
  Picker,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

import Database from '../../../../includes/firebase/database';
import Firebase from '../../../../includes/firebase/firebase';
import Navigation from '../navigation/StaticNavigation';
import States from '../../../../shared/statesList';
import ThrowConnectionMessage from './ThrowConnectionMessage';
import Warning from './Warning';


import {
  largeFontSize,
  mediumFontSize,
  primaryBlue,
  textInputWidth,
  titleTextShadow,
  xxlargeFontSize,
} from '../../styles/common';

/* global require */
export default class Profile extends Component {
  constructor() {
    super();
    this.state = {
      animating: false,
      buttonColor: primaryBlue,
      counties: [],
      countyBorder: 'black',
      email: '',
      emailBackground: 'white',
      emailBorder: 'black',
      emailWarning: false,
      isConnected: true,
      password: '',
      passwordBackground: 'white',
      passwordBorder: 'black',
      passwordWarning: false,
      profileStatus: 'Create Profile',
      selectedState: '',
      selectedCounty: 'Select your county',
      stateBorder: 'black',
      states: [],
    };
    this.createdNewUser = false;
    this.mounted = true;
    this.profile = {};
    this.profileId = null;
    this.replacedOldUser = false;
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
              style={{ backgroundColor: this.state.emailBackground, borderColor: this.state.emailBorder, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}
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
              style={{ backgroundColor: this.state.passwordBackground, borderColor: this.state.passwordBorder, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}
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
            <View style={{ borderColor: this.state.stateBorder, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}>  
              <Picker
                style={styles.picker}
                selectedValue={this.state.selectedState}
                onValueChange={(val) => this._onStateChange(val)} 
              >

                { this.state.states }

              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ borderColor: this.state.countyBorder, borderWidth: 1, width: textInputWidth, paddingLeft: 15 }}>
              <Picker
                style={styles.picker}
                selectedValue={this.state.selectedCounty}
                onValueChange={(val) => this._onCountyChange(val)} 
                enabled={this.state.selectedState === 'Select your state' ? false: true}
              >

                { this.state.counties }

              </Picker>
            </View>
          </View>

        <TouchableOpacity
          style={{ 
            backgroundColor: this.state.buttonColor,
            width: '50%',
            justifyContent: 'flex-end',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: '15%',
            padding: '4%',
            borderRadius: 10, 
          }}
          activeOpacity={.9}
          onPress={() => this._setNewProfile()}
        >
          <View>
            <Text style={styles.buttonText}>{ this.state.profileStatus }</Text>
          </View>
        </TouchableOpacity>

        { this.state.isConnected ? null : <ThrowConnectionMessage /> }
        <ActivityIndicator
          animating={this.state.animating}
          style={styles.activity}
          size='large' />
      </View>
    );
  }

  async componentWillMount() {
    await this._getProfileFromAsyncStorage();
    this._setStatesPicker();
    this._setCountiesPickerAndSelectedState();
  }

  componentDidMount() {
    this.mounted = true;
    this._signInUser();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.createdNewUser) {
      Firebase.signInUser(this.state.email, this.state.password);
      setTimeout(() => {
        let id = Firebase.getCurrentUser();
        let refPath = `${States[this.state.selectedState]['abbr']}/${this.state.selectedCounty}/${id}`;
        AsyncStorage.setItem('@Enforce:refPath', refPath);
        AsyncStorage.setItem('@Enforce:profileId', id);
      }, 1500);
      return;
    }
    if (this.replacedOldUser) {
      Database.deleteUserTickets(this.profile.state, this.profile.county, this.profileId);
      Firebase.signInUser(this.state.email, this.state.password);
      setTimeout(() => {
        let newId = Firebase.getCurrentUser();
        let refPath = `${States[this.state.selectedState]['abbr']}/${this.state.selectedCounty}/${newId}`;
        AsyncStorage.setItem('@Enforce:refPath', refPath);
        AsyncStorage.setItem('@Enforce:profileId', newId);
        Database.transferUserData(refPath, this.data); // Port old data into new account
      }, 1500);
    }
  }

  async _getProfileFromAsyncStorage() {
    this.profile = await AsyncStorage.getItem('@Enforce:profileSettings');
    this.profile = JSON.parse(this.profile);
    this.profile && this.setState({
      email: this.profile.email ? this.profile.email : '',
      password: this.profile.password ? this.profile.password : '',
      selectedCounty: this.profile.county ? this.profile.county : 'Select your county',
    });
  }

  async _signInUser() {
    this.profileId = await AsyncStorage.getItem('@Enforce:profileId');
    this.profileId && Firebase.signInUser(this.profile.email, this.profile.password);
  }

  async _setNewProfile() {
    if (this.state.emailWarning || this.state.passwordWarning) return;
    if (this.state.selectedState === 'Select your state' || this.state.selectedCounty === 'Select your county') {
      if (this.state.selectedState === 'Select your state') this.setState({stateBorder: 'red'});
      if (this.state.selectedCounty === 'Select your county') this.setState({countyBorder: 'red'});
      return;
    }
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this.setState({animating: true, profileStatus: 'Creating Profile', isConnected: true, buttonColor: 'green'});
        setTimeout(() => {
          this.mounted && this.setState({animating: false, profileStatus: 'Done', buttonColor: primaryBlue});
          setTimeout(() => {
            this.mounted && this.setState({profileStatus: 'Create Profile'});
          }, 1500);
        }, 3000);
        var settings = {
          email: this.state.email,
          password: this.state.password,
          state: States[this.state.selectedState]['abbr'],
          spelledState: this.state.selectedState,
          county: this.state.selectedCounty,
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
          if (this.profile.email !== this.state.email || this.profile.county !== this.state.selectedCounty) {

            var refPath = `/${this.profile.state}/${this.profile.county}/${this.profielId}/`;
            // TODO Check if user wants to retain old records first
            Database.getUserTickets(refPath, (data) => {
              // Gather all the data on current account to ready for port.
              this.data = data;
              Firebase.deleteUser();
            });


            AsyncStorage.setItem('@Enforce:profileSettings', settings);

            Firebase.createNewUser(this.state.email, this.state.password);

            this.replacedOldUser = true;
          }
        } catch (err) {
          //console.warn('Error updating profile setting', err);
        }
      } else {
        this.setState({isConnected: false});
        setTimeout(() => {
          this.mounted && this.setState({isConnected: true});
        }, 5000);
      }
    });
  }

  _setStatesPicker() {
    var states = [],
        key = 0;

    states.push(<Picker.Item label={'Select your state'} value={'Select your state'} key={key - 1}/>);
    for (let state in States) {
      states.push(<Picker.Item label={state} value={state} key={key}/>);
      key++;
    }
    this.mounted && this.setState({states});
  }

  _setCountiesPickerAndSelectedState() {
    var counties = [],
        savedState = undefined;

    counties.push(<Picker.Item label={'Select your county'} value={'Select your county'} key={-1}/>);
    if (this.profile.state || this.profile.spelledState) {
      if (this.profile.spelledState) {
        savedState = this.profile.spelledState;
      } else {
        for (let state in States) {
          if (States[state]['abbr'] === this.profile.state) {
            savedState = state;
            break;
          }
        }
      }
      counties.push(<Picker.Item label={'Select your county'} value={'Select your county'} key={-1}/>);
      for (let i = 0; i < States[savedState]['counties'].length; i++) {
        counties.push(<Picker.Item label={States[savedState]['counties'][i]} value={States[savedState]['counties'][i]} key={i}/>);
      }
    }

    if (savedState) {
      this.mounted && this.setState({counties, selectedState: savedState});
    } else {
      this.mounted && this.setState({counties});
    }
  }

  _onEmailFocus() {
    this.setState({emailBorder: primaryBlue, emailBackground: '#e8eae9'});
  }

  _onEmailBlur() {
    let email = this.state.email;
    let regexForCom = /.(?=\.com$)/g;
    let regexForAt = /@{1}/g;
    let com = regexForCom.test(email);
    let at = regexForAt.test(email);
    if (!com || !at) {
      this.setState({emailBorder: 'red', emailWarning: true, emailBackground: 'white'});
      return;
    }
    this.setState({emailBorder: 'black', emailWarning: false, emailBackground: 'white'});
  }

  _onPasswordChangeText(text) {
    if (this.state.passwordWarning && text.length >= 6) {
      this.setState({passwordWarning: false, password: text});
      return;
    }
    this.setState({password: text});
  }

  _onPasswordFocus() {
    this.setState({passwordBorder: primaryBlue, passwordBackground: '#e8eae9'});
  }

  _onPasswordBlur() {
    Keyboard.dismiss();
    if (this.state.password.length < 6) {
      this.setState({passwordBorder: 'red', passwordWarning: true, passwordBackground: 'white'});
      return;
    }
    this.setState({passwordBorder: 'black', passwordWarning: false, passwordBackground: 'white'});
  }

  _onStateChange(selectedState) {
    Keyboard.dismiss();
    if (this.state.selectedState !== selectedState && selectedState !== 'Select your state') {
      var counties = [];
      
      counties.push(<Picker.Item label={'Select your county'} value={'Select your county'} key={-1}/>);
      for (let i = 0; i < States[selectedState]['counties'].length; i++) {
        counties.push(<Picker.Item label={States[selectedState]['counties'][i]} value={States[selectedState]['counties'][i]} key={i}/>);
      }

      if (this.state.stateBorder === 'red') { // Read error first
        this.mounted && this.setState({selectedState, counties, selectedCounty: 'Select your county', stateBorder: 'black'});
      } else {
        this.mounted && this.setState({selectedState, counties, selectedCounty: 'Select your county'});
      }
      return;
    } else {
      this.mounted && this.setState({selectedState, selectedCounty: 'Select your county'}); // User can select "Select your state" to reset both Pickers
    }
  }

  _onCountyChange(selectedCounty) {
    if (this.state.countyBorder === 'red' && selectedCounty !== 'Select your county') {
      this.setState({selectedCounty, countyBorder: 'black'});
      return;
    }
    this.setState({selectedCounty});
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
  buttonText: {
    fontSize: largeFontSize,
    color: 'white',
  },
  picker: {
    color: primaryBlue,
    width: textInputWidth,
  },
  activity: {
    position: 'absolute',
    bottom: '2%',
    alignSelf: 'center',
  },
});
