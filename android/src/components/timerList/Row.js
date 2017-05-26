import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';

// import RNFS from 'react-native-fs';
// import watson from 'watson-developer-cloud/visual-recognition/v3';
// const visual_recognition = watson.visual_recognition({
//   api_key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJva3RhLXVzZXItbGFzdE5hbWUiOiJMaSIsInN1YiI6Im9hdXRoLWV4dC1va3RhX0FVVEhOIiwib2t0YS11c2VyLWlkIjoiMDB1ZGtmazh0NFVZaVpsOVcweDciLCJpc3MiOiJFWFBFUklBTiIsIm9rdGEtdXNlci1wcm9kdWN0T3B0aW9ucyI6bnVsbCwiZXhwIjoxNDk1NzczODkwLCJpYXQiOjE0OTU3NDUwOTAsIm9rdGEtdXNlci1maXJzdE5hbWUiOiJBbmR5In0.CfNLPOxFXAejw0lh5Rs-hiwuL45RZgJVKMZsbIufOC0-Td2YP93M0X0oaR9l0sp_YUOeEkCwYIMCtPWp-kyL76w-FsrprsDgGXti-LWpg9yDr06FkL1gmmhsC-HTM1hY5soLdp_bim7JNnEPfhnXhxxPW1LayjgcPuKXmSuEvNpLNtGioXkOUCBUcJP1kVxVIpEehvOGHffKmSBuugwFrzKwym2DNkja3Jl6bWUzwmwD82apZDhopJ2Jr8d24Zo40pLwv926mexENxE8A9A07CUHn80s9vbdp8Gcdu7ueQYFWPJyCtyoMJ3UGESsaXq3crFhSLk0Kl97NaqTkzWQlw',
//   version: 'v3',
//   version_date: '2016-05-19'
// });

export default class Row extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container} >
        <Image
          style={styles.image}
          source={{uri: this.props.mediaUri}} />
        <View style={styles.descriptionContainer}>
          <Text style={styles.timeLeft}>{this._getTimeLeft(this.props)}</Text>
          <View style={styles.timeContainer}>
          <Text style={styles.description}>Recorded at</Text>
          <Text style={styles.timeCreatedAt}>{this._getPrettyTimeFormat(this.props.createdAtDate)}</Text>
          </View>
        </View>
        <View style={styles.buttonsContainer} >
          <View style={styles.rowButtonsContainers} >
            <TouchableHighlight
              style={styles.rowButton} >
              <Text style={styles.buttonText}> Expired </Text>
            </TouchableHighlight>
            <View style={styles.separator} />
            <TouchableHighlight
              style={styles.rowButton}
              onPress={() => this._updateList(this.props.key)}>
              <Text style={styles.buttonText}> Ticketed </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }

  // _onGetVinPress() {
  //   // TODO IBM Watson api
  //   // RNFS.readFile(this.props.mediaPath).then((result) => console.log('RESULT!', result));
  //   // const params = {
  //   //   images_file: RNFS.readFile(this.props.mediaPath)
  //   // }
  //   let inputView = [
  //     <View style={styles.inputContainer}>
  //       <Text>License:</Text>
  //       <TextInput
  //         style={styles.textInput}
  //         onChangeText={(license) => this._onChangeInput(license)}
  //         maxLength={7}
  //         autoCapitalize={'characters'}
  //         placeHolder={'1ABC234'}
  //         autoCorrect={false}
  //         value={this.state.license} />
  //       { /* TODO set up integration account with Experian/AutoCheck */ }
  //       <TouchableHighlight
  //         style={styles.inputButton}
  //         onPress={()=>{}} >
  //         <Text style={styles.inputButtonText}>Request</Text>
  //       </TouchableHighlight>
  //     </View>
  //   ];
  //   this.setState({transitionView: inputView});
  // }

  _onVinRequest() {
    let options = {
    }
  }

  _getPrettyTimeFormat(date) {
    // TODO 8:6 FIX
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    miuntes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    return `${hour}:${minutes} ${period}`;
  }

  _getTimeLeft(timer) {
    let timeLength = timer.timeLength * 60 * 60;
    let timeStart = timer.createdAt;
    let timeSince = (new Date() / 1000) - timeStart;
    let timeLeft = timeLength - timeSince;
    let value = '';
    if (timeLeft < 0) {
      return value = 'Time is up!';
    } else if (timeLeft < 60) {
      return value = 'less than a minute remaining';
    } else if (timeLeft < 3600) {
      return value = Math.floor(timeLeft / 60) + ' minutes remaining';
    } else if (timeLeft > 3600 && timeLeft < 7200) {
      return value = '1 hour ' + Math.floor((timeLeft - 3600) / 60) + ' minutes remaining';
    } else if (timeLeft > 7200 && timeLeft < 10800) {
      return value = '2 hours ' + Math.floor((timeLeft - 7200) / 60) + ' minutes remaining';
    } else if (timeLeft > 10800 && timeLeft < 14400) {
      return value = '3 hours ' + Math.floor((timeLeft - 14400) / 60) + ' minutes remaining';
    } else {
      return value = 'Time is unknown.';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: 400,
    //flex: .8,
  },
  activity: {
    flex: 1,
    zIndex: 10,
  },
  buttonsContainer: {
    //alignItems: 'center',
    //justifyContent: 'center',
    alignSelf: 'stretch',
  },
  rowButtonsContainers: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: 'white',
    height: 60,
  },
  rowButton: {
    flex: .5,
    backgroundColor: '#4286f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  timeContainer: {
    flexDirection: 'column',
  },
  timeLeft: {
    fontSize: 16,
  },
  timeCreatedAt: {
    color: '#4286f4',
    fontSize: 30,
  },
});
