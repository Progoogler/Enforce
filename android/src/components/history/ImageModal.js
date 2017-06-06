import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  Modal,
  TouchableHighlight,
} from 'react-native';

export default class ImageModal extends Component {
  constructor() {
    super();
  }

  render() {
    const { height } = Dimensions.get('window');
    styles.image = {
      alignSelf: 'stretch',
      height: height - 100,
    };
    return (
      <Modal animationType={"slide"}
        transparent={true}
        onRequestClose={() => this.props.maximizeImage()}
        visible={this.props.visibility} >
        <View>
          <Image style={styles.image} source={{uri: this.props.uri}} />
          <View style={styles.buttonContainer}>
          <TouchableHighlight
            style={styles.button}
            underlayColor='#4286f4'
            onPress={() => this.props.maximizeImage()} >
            <Text style={styles.buttonText}>X</Text>
          </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  buttonContainer: {
    backgroundColor: '#4286f4',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 100,
  },
  button: {
    justifyContent: 'center',
    height: 60,
    width: 60,
    borderRadius: 30,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4286f4',
    fontFamily: 'sans-serif-medium',
  },
});
