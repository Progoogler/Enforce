import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  TouchableHighlight,
} from 'react-native';

export default class LocationInput extends Component {
  constructor() {
    super();
    this.state = {
      text: "",
    }
  }



  render() {
    return (
      <Modal animationType={"slide"}
        transparent={false}
        visible={this.props.visibility}
        onRequestClose={() => this.props.setModalVisible()} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => this.props.setModalVisible()}
                title="X" />
            </View>
            <Text style={styles.title}>Location Details:</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                onChangeText={(text) => this.setState({text})}
                autoCorrect={false}
                maxLength={75}
                multiline={true}
                autoFocus={true}
                value={this.state.text} />
            </View>
            <TouchableHighlight
              style={styles.doneButton}
              onPress={()=>{}} >
              <Text style={styles.doneText}>Done</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4286f4',
  },
  containerBorder: {
    backgroundColor: 'white',
    margin: 10,
    padding: 5,
  },
  buttonContainer: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 30,
  },
  title: {
    fontSize: 20,
    marginLeft: 15,
  },
  textInputContainer: {
    marginLeft: 15,
  },
  doneButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'green',
    margin: 15,
    width: 60,
    borderRadius: 6,
  },
  doneText: {
    fontSize: 20,
    padding: 4,
    color: 'white',
  },
});
