import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

export default class Warning extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => {this.props.clearWarning('clearWarning', true)}}
        visible={this.props.visibility} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >

            <Text style={styles.message}> Vehicle has parked for </Text>
            <Text style={styles.warning}> {this.props.timeElapsed} </Text>
            <Text style={styles.message}> Are you sure </Text>
            <Text style={styles.message}> you want to ticket now? </Text>
            <View style={styles.buttons} >
              <TouchableOpacity
                style={styles.no}
                activeOpacity={.8}
                onPress={() => {this.props.clearWarning('clearWarning', true)}} >
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.yes}
                activeOpacity={.6}
                onPress={() => { this.props.uponTicketed([], 'force')}} >
                <Text style={styles.yesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

Warning.propTypes = {
  clearWarning: PropTypes.func.isRequired,
  visibility: PropTypes.bool.isRequired,
  timeElapsed: PropTypes.string.isRequired,
  uponTicketed: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    marginTop: 170,
    backgroundColor: '#4286f4',
    padding: 15,
  },
  containerBorder: {
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5,
    padding: 20,
  },
  warning: {
    color: 'green',
    fontWeight: 'bold',
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
  noButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  yesButtonText: {
    fontSize: 22,
    color: '#4286f4',
  },
  no: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#4286f4',
    marginRight: 50,
    padding: 10,
  },
  yes: {
    padding: 10,
  }
});
