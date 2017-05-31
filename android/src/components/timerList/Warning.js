import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableHighlight,
} from 'react-native';

export default class Warning extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => {this.props.throwWarning()}}
        visible={this.props.visibility} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >
            <Text style={styles.title}>Alert!</Text>
            <Text style={styles.message}> Vehicle has parked for </Text>
            <Text style={styles.warning}> {this.props.timeElapsed} </Text>
            <Text style={styles.message}> Are you sure </Text>
            <Text style={styles.message}> you want to ticket now? </Text>
            <View style={styles.buttons} >
              <TouchableHighlight
                style={styles.no}
                underlayColor='#4286f4'
                onPress={() => {this.props.throwWarning()}} >
                <Text style={styles.buttonText}>No</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={styles.yes}
                underlayColor='#4286f4'
                onPress={() => { this.props.forceTicket(); this.props.throwWarning() }} >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 110,
    backgroundColor: 'red',
    padding: 15,
  },
  containerBorder: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: 'red',
    fontSize: 28,
  },
  warning: {
    fontSize: 24,
    margin: 10,
  },
  message: {
    fontSize: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 22,
    color: 'white',
  },
  no: {
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: 'green',
    marginRight: 50,
    padding: 20,
  },
  yes: {
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: 'red',
    padding: 20,
  }
});
