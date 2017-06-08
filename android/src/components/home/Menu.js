import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
  Keyboard,
  Animated,
} from 'react-native';

import MainButtons from './MainButtons';
import Search from '../search';


export default class Header extends Component {
  constructor() {
    super();
    this.state = {
      buttonOpacity: new Animated.Value(1),
      titleOpacity: new Animated.Value(0),
      search: false,
    };
  }

  render() {
    return (

      <View style={styles.container}>
      {

        this.state.search ?

        <Search navigation={this.props.navigation} closeSearch={this.closeSearch.bind(this)}/> :

        <View style={styles.container}>
        <View style={styles.headerContainer} >
          <TouchableHighlight
            onPress={ () => {
              Animated.parallel([
                Animated.timing(
                  this.state.titleOpacity,
                  { toValue: 0,
                    duration: 500, },
                ),
                Animated.timing(
                  this.state.buttonOpacity,
                  { toValue: 0,
                    duration: 500, },
                ),
              ]).start();
              this.setState({
                              search: !this.state.search,
                              titleOpacity: new Animated.Value(0),
                              buttonOpacity: new Animated.Value(0),
                            });
            }}
            underlayColor={'#4286f4'}
            style={styles.searchIcon} >
            <Image source={require('../../../../shared/images/search-icon.png')} />
          </TouchableHighlight>
          <Animated.Text style={{
            opacity: this.state.titleOpacity,
            flex: .70,
            height: 60,
            fontSize: 32,
            color: 'white',
            textAlignVertical: 'center',
          }}>{ this.props.title ? this.props.title : 'Enforce' }</Animated.Text>
          <TouchableHighlight
            underlayColor='#4286f4'
            onPress={ () => {
              Keyboard.dismiss();
              this.props.navigation.navigate('DrawerOpen');
            }}
            style={styles.headerNavigation} >
            <Image source={require('../../../../shared/images/menu-icon.jpg')} />
          </TouchableHighlight>
          </View>
          <Animated.View style={{ opacity: this.state.buttonOpacity }} >
          <MainButtons navigation={this.props.navigation} />
          </Animated.View>
        </View>

      }
      </View>
    );
  }

  componentDidMount() {
    Animated.timing(
      this.state.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
    setTimeout(() => this.setState({ titleOpacity: new Animated.Value(1) }), 550);
  }

  closeSearch() {
    this.setState({ search: !this.state.search });
    Animated.parallel([
      Animated.timing(
        this.state.titleOpacity,
        { toValue: 1,
          duration: 500, },
      ),
      Animated.timing(
        this.state.buttonOpacity,
        { toValue: 1,
          duration: 500, },
      ),
    ]).start();
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    height: 130,
    alignSelf: 'stretch',
    backgroundColor: '#4286f4',
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#4286f4',
    zIndex: 10,
  },
  searchIcon: {
    marginTop: 5,
    marginRight: 5,
    height: 60,
    width: 60,
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
});
