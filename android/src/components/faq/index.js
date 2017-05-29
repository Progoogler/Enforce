import React, { Component } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Header from '../home/Header';

export default class FAQs extends Component {
  static navigationOptions = {
    drawerLabel: 'FAQs',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/question-mark.png')}
        style={[styles.icon]}
      />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />
        <ScrollView>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.question}>How to get started?</Text>
          <Text style={styles.answer}>1. Turn on GPS, wifi, and mobile data</Text>
          <Text style={styles.answer}>2. Open Camera app</Text>
          <Text style={styles.answer}>3. Set time limit for current timer</Text>
          <Text style={styles.answer}>4. Add location reminder details</Text>
          <Text style={styles.answer}>5. Snap pictures of license plates</Text>
          <Text style={styles.answer}>6. Wait until "Time is up!" appears</Text>
          <Text style={styles.answer}>7. Press on "Time is up!"</Text>
          <Text style={styles.answer}>8. Go to location of first picture</Text>
          <Text style={styles.answer}>9. Log "Expired" or "Ticketed" for cars</Text>
          <Text style={styles.answer}>10. Go back to Home and check on timers</Text>

          <Text style={styles.question}>Why are the location markers not precise?</Text>
          <Text style={styles.answer}>Sometimes bad network connections can affect the precision of geolocation features. We recommend to always add a location reminder for the first picture and any subsequent ones which seem off course and difficult to navigate to between A and B. </Text>

          <Text style={styles.question}>What if I need to switch between 1 hour and 2 hour zones?</Text>
          <Text style={styles.answer}>Each time a new time limit is set in the camera app, a new timer begins for that length of time.</Text>

          <Text style={styles.question}>Do I need to use mobile data in order to use the app?</Text>
          <Text style={styles.answer}>Technically, it is not necessary. But to take advantage of all the features such as geolocation, searching for VINs, and uploading the history log of tickets to our cloud database, it is recommended to have internet connection.</Text>

        </ScrollView>
        <View style={styles.footer} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
  },
  title: {
    alignSelf: 'center',
    color: '#4286f4',
    margin: 35,
    fontSize: 22,
  },
  question: {
    fontWeight: 'bold',
    margin: 15,
    fontSize: 18,
    paddingRight: 25,
  },
  answer: {
    fontSize: 15,
    paddingLeft: 25,
    paddingRight: 35,
  },
  footer: {
    marginBottom: 40,
  },
});
