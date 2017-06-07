import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from 'react-native';


export default class Header extends Component {
  constructor() {
    super();
    this.state = { text: '' };
  }

  render() {
    return (
      <View style={styles.headerContainer} >
        <Text style={styles.headerTitle}>{ this.props.title ? this.props.title : 'Enforce' }</Text>
        <TouchableHighlight
          underlayColor='#4286f4'
          onPress={ () => {
            this.props.navigation.navigate('DrawerOpen');
          }}
          style={styles.headerNavigation} >
          <Image source={require('../../../../shared/images/menu-icon.jpg')} />
        </TouchableHighlight>
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
    paddingLeft: 36,
    fontSize: 32,
    color: 'white',
    textAlignVertical: 'center',
  },
});
