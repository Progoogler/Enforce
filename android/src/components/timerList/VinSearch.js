import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableHighlight,
} from 'react-native';

// import RNFS from 'react-native-fs';
// import watson from 'watson-developer-cloud/visual-recognition/v3';
// const visual_recognition = watson.visual_recognition({
//   api_key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJva3RhLXVzZXItbGFzdE5hbWUiOiJMaSIsInN1YiI6Im9hdXRoLWV4dC1va3RhX0FVVEhOIiwib2t0YS11c2VyLWlkIjoiMDB1ZGtmazh0NFVZaVpsOVcweDciLCJpc3MiOiJFWFBFUklBTiIsIm9rdGEtdXNlci1wcm9kdWN0T3B0aW9ucyI6bnVsbCwiZXhwIjoxNDk1NzczODkwLCJpYXQiOjE0OTU3NDUwOTAsIm9rdGEtdXNlci1maXJzdE5hbWUiOiJBbmR5In0.CfNLPOxFXAejw0lh5Rs-hiwuL45RZgJVKMZsbIufOC0-Td2YP93M0X0oaR9l0sp_YUOeEkCwYIMCtPWp-kyL76w-FsrprsDgGXti-LWpg9yDr06FkL1gmmhsC-HTM1hY5soLdp_bim7JNnEPfhnXhxxPW1LayjgcPuKXmSuEvNpLNtGioXkOUCBUcJP1kVxVIpEehvOGHffKmSBuugwFrzKwym2DNkja3Jl6bWUzwmwD82apZDhopJ2Jr8d24Zo40pLwv926mexENxE8A9A07CUHn80s9vbdp8Gcdu7ueQYFWPJyCtyoMJ3UGESsaXq3crFhSLk0Kl97NaqTkzWQlw',
//   version: 'v3',
//   version_date: '2016-05-19'
// });

export default class VinSearch extends Component {
  constructor() {
    super();
    this.state = {
      text: '',
      done: true, //TODO Design change upon response from Experian
      animating: false,
    }
    // this.transitionView = [
    //   <View style={styles.inputContainer}>
    //     <Text>License:</Text>
    //     <TextInput
    //       style={styles.textInput}
    //       onChangeText={(text) => this.setState({text})}
    //       maxLength={7}
    //       autoCapitalize={'characters'}
    //       placeHolder={'1ABC234'}
    //       autoCorrect={false}
    //       underlineColorAndroid={'transparent'}
    //       value={this.state.license} />
    //     { /* TODO set up integration account with Experian/AutoCheck */ }
    //     <TouchableHighlight
    //       style={styles.inputButton}
    //       onPress={()=>{}} >
    //       <Text style={styles.inputButtonText}>Search VIN</Text>
    //     </TouchableHighlight>
    //   </View>,
    //   <View style={style.responseView}>
    //     <Text>{ "The response VIN" /* TODO */}</Text>
    //     <TouchableHighlight
    //       style={styles.doneButton}
    //       onPress={()=>{}} >
    //       <Text>Done</Text>
    //     </TouchableHighlight>
    //   </View>
    // ]
  }

  render() {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.designator}>License:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.setState({text})}
          maxLength={7}
          autoCapitalize={'characters'}
          keyboardType={'numeric'}
          placeHolder={'1ABC234'}
          autoCorrect={false}
          underlineColorAndroid={'transparent'}
          value={this.state.license} />
        { /* TODO set up integration account with Experian/AutoCheck */ }
        <TouchableHighlight
          style={styles.inputButton}
          onPress={()=>{}} >
          <Text style={styles.inputButtonText}>Search VIN</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingLeft: 15,
    paddingRight: 15,
  },
  textInput: {
    flex: .6,
    height: 40,
  },
  designator: {
    fontSize: 18,
  },
  inputButton: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'green',
    alignItems: 'center',
    flex: .4,
  },
  inputButtonText: {
    color: 'white',
    fontSize: 16,
    padding: 4,
  },
  responseView: {

  },
  doneButton: {

  },
});
