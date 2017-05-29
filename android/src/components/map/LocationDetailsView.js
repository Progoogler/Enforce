import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default class LocationDetailsView extends Component {
  constructor() {
    super();
    this.state = {
      details: "",
    }
  }

  render() {
    return (
      <View style={styles.container} >
        <View style={styles.containerBorder} >
          <Text style={styles.title}>Location Details:</Text>
          <Text style={styles.details}> { this.state.details } </Text>
        </View>
      </View>
    );
  }

  componentDidMount() {
    this.getLocationDetails();
  }

  getLocationDetails() {
    if (this.props.navigation.state.params.timers) {
      let details = "", i = 0;
      while (details.length === 0 && i < this.props.navigation.state.params.timers.length) {
        details = this.props.navigation.state.params.timers[i].description;
        i++;
      }
      if (details === "") details = "Pro Tip: Add location details for the first record of new timers for better recall.";
      this.setState({details});
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4286f4',
    alignSelf: 'stretch',
    zIndex: 10,
  },
  containerBorder: {
    backgroundColor: 'white',
    margin: 10,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',    
    marginLeft: 15,
    marginTop: 5,
  },
  details: {
    fontSize: 16,
    margin: 15,
    padding: 10,
  },
});
