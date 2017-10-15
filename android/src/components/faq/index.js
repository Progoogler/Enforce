import React, { Component } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Navigation from '../navigation/StaticNavigation';
 
import Messenger from './Messenger';
import Feedback from './Feedback';
import {
  largeFontSize,
  mediumFontSize,
  primaryBlue,
  smallFontSize,
} from '../../styles/common';

/*global require*/
export default class FAQs extends Component {
  static navigationOptions = {
    drawerLabel: 'FAQs',
    drawerIcon: () => (
      <Image source={require('../../../../shared/images/question-mark.png')} />
    )
  };

  constructor() {
    super();
    this.closeMessenger = this.closeMessenger.bind(this);
    this.mounted = false;
    this.openMessenger = this.openMessenger.bind(this);
    this.welcome = this.welcome.bind(this);
    this.state = {
      messaging: false,
      reply: false,
      thanks: false,
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Messenger
          closeMessenger={this.closeMessenger}
          visibility={this.state.messaging}
        />
        <Navigation navigation={this.props.navigation} title={'FAQs'} />
        <ScrollView>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.question}>How to get started?</Text>
          <Text style={styles.answer}>1. Turn on GPS, wifi, and mobile data</Text>
          <Text style={styles.answer}>2. Open Camera app</Text>
          <Text style={styles.answer}>3. Set time limit for current timer</Text>
          <Text style={styles.answer}>4. Add location reminder details</Text>
          <Text style={styles.answer}>5. Snap pictures of license plates</Text>
          <Text style={styles.answer}>6. Wait until {"Time is up!"} appears</Text>
          <Text style={styles.answer}>7. Press on {"Time is up!"}</Text>
          <Text style={styles.answer}>8. Go to location of first picture</Text>
          <Text style={styles.answer}>9. Log {"Expired"} or {"Ticketed"} for cars</Text>
          <Text style={styles.answer}>10. Go back to Home and check on timers</Text>

          <Text style={styles.question}>Why are the location markers not precise?</Text>
          <Text style={styles.answer}>Sometimes bad network connections can affect the precision of geolocation features. We recommend to always add a location reminder for the first picture and any subsequent ones which seem off course and difficult to navigate to between A and B. </Text>

          <Text style={styles.question}>What if I need to switch between 1 hour and 2 hour zones?</Text>
          <Text style={styles.answer}>Each time a new time limit is set in the camera app, a new timer begins for that length of time.</Text>

          <Text style={styles.question}>Do I need to use mobile data in order to use the app?</Text>
          <Text style={styles.answer}>Technically, it is not necessary. But to take advantage of all the features such as geolocation, searching for VINs, and uploading the history log of tickets to our cloud database, it is recommended to have internet connection.</Text>

          <Text style={styles.question}>How would I know where the car is without GPS?</Text>
          <Text style={styles.answer}>It is worth reiterating that we suggest adding location details to the first picture of a timer. Another way is to take a picture of the street sign or some nearby landmark that will serve as a reminder.</Text>
          <View style={styles.spacing}/>
        </ScrollView>
        <Feedback 
          openMessenger={this.openMessenger}
          reply={this.state.reply}
          thanks={this.state.thanks}
          welcome={this.welcome}
        />
      </View>
    );
  }

  componentDidMount() {
    this.mounted = true;
  }

  openMessenger() {
    this.mounted && this.setState({messaging: true});
  }

  closeMessenger(type) {
    if (type === 'thanks') {
      this.mounted && this.setState({
        messaging: false,
        thanks: true,
      });
      return;
    } else if (type === 'reply') {
      this.mounted&& this.setState({
        messaging: false,
        reply: true,
      });
      return;
    }
    this.mounted && this.setState({messaging: false});
  }

  welcome() {
    this.mounted && this.setState({thanks: false, reply: false});
  }
}

FAQs.propTypes = { navigation: PropTypes.object.isRequired }

const styles = StyleSheet.create({
  answer: {
    fontSize: smallFontSize,
    paddingLeft: '7%',
    paddingRight: '7%',
  },
  container: {
    flex: 1,
  },
  spacing: {
    marginBottom: '10%',
  },  
  title: {
    alignSelf: 'center',
    color: primaryBlue,
    marginTop: '10%',
    marginBottom: '3%',
    fontSize: largeFontSize,
  },
  question: {
    fontWeight: 'bold',
    margin: '5%',
    fontSize: mediumFontSize,
  },
});
