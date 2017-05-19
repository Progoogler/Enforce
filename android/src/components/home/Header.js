import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
} from 'react-native';
import Realm from 'realm';

const styles = StyleSheet.create({
  headerContainer: {
    flex: .14,
    flexDirection: 'row',
  },
  headerNavigation: {
    flex: .15,
    height: 60,
    borderWidth: 2,
    borderColor: 'black',
    justifyContent: 'center',
  },
  headerNavButton: {
    textAlign: 'center',
  },
  headerTitle: {
    flex: .70,
    height: 60,
    paddingLeft: 20,
    borderWidth: 2,
    borderColor: 'red',
    textAlignVertical: 'center',
  },
  headerSearchButton: {
    flex: .15,
    height: 60,
    borderWidth: 2,
    borderColor: 'black',
    justifyContent: 'center',
  },
  headerSearchIcon: {
    textAlign: 'center',
  },
});

class Header extends Component {
  constructor() {
    super();
    this.state = { text: '' };
  }

  // <TextInput
  //   style={styles.searchBox}
  //   onChangeText={(text) => this.setState({text})}
  //   value={this.state.text} />

  render() {
    return (
      <View style={styles.headerContainer} >
        <TouchableHighlight
          onPress={ () => {
            this.props.navigation.navigate('DrawerOpen');
          }}
          style={styles.headerNavigation} >
          <Text style={styles.headerNavButton}> * </Text>
        </TouchableHighlight>

        <Text style={styles.headerTitle}>Quicket</Text>
        <TouchableHighlight
          style={styles.headerSearchButton} >
          <Text style={styles.headerSearchIcon}> o </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

export default Header;
