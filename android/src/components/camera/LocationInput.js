import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';

export default class LocationInput extends Component {
  constructor() {
    super();
    this.state = {
      firstLineText: '',
      secondLineText: '',
    }
    this._firstLineText;
    this._secondLineText;
  }

  render() { console.log(AutoGrowingTextInput);
    return (
      <Modal animationType={'slide'}
        transparent={true}
        visible={this.props.visibility}
        onRequestClose={() => this.props.setModalVisible(this.state.text)} >
        <View style={styles.container} >
          <View style={styles.containerBorder} >

            <Text style={styles.title}>Location Details:</Text>
            <View style={styles.textInputContainer}>
              <AutoGrowingTextInput
              style={styles.textInput}
                ref={(ref) => this._firstLineText = ref}
                onChange={(text) => this._handleTextInput(text, 'first')}
                //underlineColorAndroid={'white'}
                //autoCorrect={false}
                fontSize={26}
                maxLength={60}
                //initialHeight={60}
                //multiline={true}
                autoFocus={true}
                value={this.state.firstLineText} />

            </View>
            <Text style={styles.count}>{60 - this.state.firstLineText.length} characters remaining</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.xButton}
                onPress={() => {
                  this.setState({firstLineText: '', secondLineText: ''});
                  this.props.setModalVisible('');
                }}>
                <Text style={styles.x}>Cancel</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={.6}
                onPress={() => {
                  let desc = this.state.firstLineText[this.state.firstLineText.length - 1] === ' ' ?
                    this.state.firstLineText + this.state.secondLineText :
                    this.state.firstLineText + ' ' + this.state.secondLineText;
                  this.props.setModalVisible(desc);
                  this.setState({firstLineText: '', secondLineText: ''});
                }} >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // <TextInput
  //   ref={(ref) => this._secondLineText = ref}
  //   onChangeText={(text) => this._handleTextInput(text, 'second')}
  //   autoCorrect={false}
  //   fontSize={26}
  //   maxLength={30}
  //   multiline={true}
  //   value={this.state.secondLineText} />

  _handleTextInput(text, line) { console.log('text', text, 'l', text.length, 'line', line)
  this.setState({firstLineText: text});
    // if (line === 'first') {
    //    if (text.length < 31) {
    //      this.setState({firstLineText: text});
    //    } else {
    //     //  if (text[text.length - 1] !== ' ') { console.log("refocus")
    //     //    let carry = '';
    //     //    let origin;
    //     //    let i = text.length - 1;
    //     //    while (text[i] !== ' ') {
    //     //      carry += text[i];
    //     //      i--;
    //     //    }
    //     //    carry = carry.split('').reverse().join('');
    //     //    origin = text.slice(0, i);
    //     //    this.setState({firstLineText: origin, secondLineText: carry});
    //     //  }
    //     this.setState({secondLineText: text[text.length - 1]});
    //      this._secondLineText.focus();
    //    }
    //    return;
    // }
    // if (line === 'second') {
    //   if (text.length === 0) {
    //     this.setState({secondLineText: text});
    //     this._firstLineText.focus();
    //   } else {
    //     this.setState({secondLineText: text});
    //   }
    // }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4286f4',
    marginTop: 60,
  },
  containerBorder: {
    margin: 10,
    padding: 5,
  },
  textInput: {

  paddingLeft: 10,
  fontSize: 17,
  flex: 1,
  backgroundColor: 'white',
  borderWidth: 0,

},
  buttonRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    margin: 15,
  },
  xButton: {
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginRight: 40,
      marginBottom: 6,
  },
  x: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 15,
  },
  textInputContainer: {
    marginLeft: 15,
    height: 120,
  },
  count: {
    marginLeft: 25,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: 'green',
    width: 60,
    borderRadius: 6,
  },
  doneText: {
    fontSize: 20,
    padding: 4,
    color: 'white',
  },
});
