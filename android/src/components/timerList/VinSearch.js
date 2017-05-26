import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableHighlight,
} from 'react-native';


export default class VinSearch extends Component {
  constructor() {
    super();
    this.state = {
      text: '',
      done: true, //TODO Design change upon response from Experian
      animating: false,
    }
    // this.transitionView = [
    //   <View style={styles.inputContainer}>
    //     <Text>License:</Text>
    //     <TextInput
    //       style={styles.textInput}
    //       onChangeText={(text) => this.setState({text})}
    //       maxLength={7}
    //       autoCapitalize={'characters'}
    //       placeHolder={'1ABC234'}
    //       autoCorrect={false}
    //       underlineColorAndroid={'transparent'}
    //       value={this.state.license} />
    //     { /* TODO set up integration account with Experian/AutoCheck */ }
    //     <TouchableHighlight
    //       style={styles.inputButton}
    //       onPress={()=>{}} >
    //       <Text style={styles.inputButtonText}>Search VIN</Text>
    //     </TouchableHighlight>
    //   </View>,
    //   <View style={style.responseView}>
    //     <Text>{ "The response VIN" /* TODO */}</Text>
    //     <TouchableHighlight
    //       style={styles.doneButton}
    //       onPress={()=>{}} >
    //       <Text>Done</Text>
    //     </TouchableHighlight>
    //   </View>
    // ]
  }

  render() {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.designator}>License:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.setState({text})}
          maxLength={7}
          autoCapitalize={'characters'}
          placeHolder={'1ABC234'}
          autoCorrect={false}
          underlineColorAndroid={'transparent'}
          value={this.state.license} />
        { /* TODO set up integration account with Experian/AutoCheck */ }
        <TouchableHighlight
          style={styles.inputButton}
          onPress={()=>{}} >
          <Text style={styles.inputButtonText}>Search VIN</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingLeft: 15,
    paddingRight: 15,
  },
  textInput: {
    flex: .6,
    height: 40,
  },
  designator: {
    fontSize: 18,
  },
  inputButton: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'green',
    alignItems: 'center',
    flex: .4,
  },
  inputButtonText: {
    color: 'white',
    fontSize: 16,
    padding: 4,
  },
  responseView: {

  },
  doneButton: {

  },
});
