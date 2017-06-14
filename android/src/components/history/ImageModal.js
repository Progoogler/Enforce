import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  Modal,
  TouchableNativeFeedback,
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
      <Modal animationType={"fade"}
        transparent={false}
        onRequestClose={() => this.props.maximizeImage()}
        visible={this.props.visibility} >
        <View>
          <Image style={styles.image} source={{uri: this.props.uri}} />

          <View style={styles.buttonContainer}>
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple('white')}
              onPress={() => this.props.maximizeImage()} >
              <View style={styles.arrowContainer}>
                <Image style={styles.backArrow} source={require('../../../../shared/images/backarrow.png')} />
              </View>
            </TouchableNativeFeedback>
          </View>

        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: '#4286f4',
    alignSelf: 'stretch',
  },
  arrowContainer: {
    justifyContent: 'center',
    width: 600,
    height: 75,
  },
  backArrow: {
    marginLeft: 25,
    width: 45,
    height: 38,
  },
  buttonText: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4286f4',
    fontFamily: 'sans-serif-medium',
  },
});
