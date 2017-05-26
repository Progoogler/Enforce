import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from 'react-native';

// TODO SEARCH
// <TextInput
//   style={styles.searchBox}
//   onChangeText={(text) => this.setState({text})}
//   value={this.state.text} />
// <TouchableHighlight
//   style={styles.headerSearchButton} >
//   <Image source={require('../../../../shared/images/search-icon.jpg')} />
// </TouchableHighlight>
// headerSearchButton: {
//   flex: .15,
//   height: 60,
//   justifyContent: 'center',
// },
// headerSearchIcon: {
//   textAlign: 'center',
// },

export default class Header extends Component {
  constructor() {
    super();
    this.state = { text: '' };
  }

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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#4286f4',
    zIndex: 10,
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
});
