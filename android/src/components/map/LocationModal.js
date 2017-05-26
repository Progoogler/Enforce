import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';

export default class LocationModal extends Component {
  constructor() {
    super();
    this.state = {
      details: "",
    }
  }

  render() {
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => {this.props.navigation.navigate('Home')}}
        visible={this.props.visibility} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >
            <Text style={styles.title}>Location Details:</Text>
            <Text style={styles.details}> { this.state.details } </Text>
          </View>
        </View>
      </Modal>
    );
  }

  componentDidMount() {
    this.getLocationDetails();
  }

  getLocationDetails() {
    if (this.props.data) {
      let details = "", i = 0;
      while (details.length === 0 && i < this.props.data.length) {
        details = this.props.data[i].description;
        i++;
      }
      this.setState({details});
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4286f4',
    marginTop: 60,
    zIndex: 10,
  },
  containerBorder: {
    backgroundColor: 'white',
    margin: 10,
    padding: 5,
  },
  title: {
    fontSize: 20,
    marginLeft: 15,
  },
  details: {
    margin: 15,
  },
});
