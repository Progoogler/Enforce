import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from 'react-native';


export default class StaticNavigation extends Component {
  constructor() {
    super();
  }

  render() { console.log('image', this.props.imageSource)
    return (
      <View style={styles.container} >
        <Image
          style={styles.icon}
          source={this.props.imageSource} />
        <Text style={styles.title}>{ this.props.title ? this.props.title : 'Enforce' }</Text>
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

  componentWillMount() {
    if (this.props.title === 'Map View') {
      styles.icon = {
        height: 30,
        width: 30,
        marginLeft: 15,
        marginTop: 16,
      };
    } else if (this.props.title === 'Metrics') {
      styles.icon = {
        height: 40,
        width: 40,
        marginLeft: 15,
        marginTop: 5,
      }
    } else {
      styles.icon = {
        // height: 40,
        // width: 40,
        // marginLeft: 15,
        // marginTop: 5,
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#4286f4',
    zIndex: 10,
  },
  title: {
    flex: .70,
    height: 60,
    fontSize: 32,
    marginLeft: 15,
    color: 'white',
    textAlignVertical: 'center',
  },
  headerNavigation: {
    flex: .15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
