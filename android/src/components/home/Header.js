import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  Image,
} from 'react-native';
import Realm from 'realm';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#3f1ae8',
  },
  headerNavigation: {
    flex: .15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerNavButton: {
    textAlign: 'center',
  },
  headerTitle: {
    flex: .70,
    height: 60,
    paddingLeft: 20,
    fontSize: 28,
    color: 'white',
    textAlignVertical: 'center',
  },
  headerSearchButton: {
    flex: .15,
    height: 60,
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
          <Image source={require('../../../../shared/images/menu-icon.jpg')} />
        </TouchableHighlight>

        <Text style={styles.headerTitle}>Quicket</Text>
        <TouchableHighlight
          style={styles.headerSearchButton} >
          <Image source={require('../../../../shared/images/search-icon.jpg')} />
        </TouchableHighlight>
      </View>
    );
  }
}

export default Header;
