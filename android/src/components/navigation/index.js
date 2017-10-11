import React, { Component } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  TouchableHighlight,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import Search from '../search';
import {
  blueTextShadow,
  navBarContainerHeight,
  primaryBlue,
  titleFontSize,
} from '../../styles/common';

/* global require */
export default class Navigation extends Component {
  constructor() {
    super();
    this.state = {
      search: false,
    };
    this.titleOpacity = new Animated.Value(0);
  }

  render() {
    return (

      <View style={styles.container}>
      {

        this.state.search ?

        <Search
          navigation={this.props.navigation}
          closeSearch={this.closeSearch.bind(this)}
          displayFirebaseResult={this.props.displayFirebaseResult}
          historyScreen={this.props.historyScreen} 
        /> 
        
        :

        <View style={styles.headerContainer} >
          <TouchableHighlight
            onPress={ () => {
              Animated.timing(
                this.titleOpacity,
                { toValue: 0,
                  duration: 500, },
              ).start();
              this.props.toggleSearching ? this.props.toggleSearching() : null;
              this.setState({ search: !this.state.search });
            }}
            underlayColor={primaryBlue}
            style={styles.searchIcon} >
            <Image source={require('../../../../shared/images/search-icon.png')} />
          </TouchableHighlight>
          <Animated.Text style={{
            opacity: this.titleOpacity,
            flex: .70,
            fontSize: titleFontSize,
            marginLeft: '2%',
            color: 'white',
            textAlignVertical: 'center',
            textShadowColor: blueTextShadow,
            textShadowOffset: {
              width: 2,
              height: 1
            },
          }}>{ this.props.title ? this.props.title : 'Enforce' }</Animated.Text>
          <TouchableHighlight
            underlayColor={primaryBlue}
            onPress={ () => {
              Keyboard.dismiss();
              this.props.navigation.navigate('DrawerOpen');
            }}
            style={styles.headerNavigation} >
            <Image source={require('../../../../shared/images/menu-icon.jpg')} />
          </TouchableHighlight>
        </View>
      }
      </View>
    );
  }

  componentWillMount() {
    this.props.search && this.setState({ search: true });
  }

  componentDidMount() {
    Animated.timing(
      this.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
  }

  closeSearch() {
    this.setState({ search: !this.state.search });
    Animated.timing(
      this.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
  }
}

Navigation.propTypes = {
  displayFirebaseResult: PropTypes.func,
  navigation: PropTypes.object.isRequired,
  historyScreen: PropTypes.bool,
  toggleSearching: PropTypes.func,
  title: PropTypes.string,
  search: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: primaryBlue,
    zIndex: 11,
  },
  headerContainer: {
    flexDirection: 'row',
    height: navBarContainerHeight,
  },
  searchIcon: {
    alignSelf: 'center',
    marginLeft: '2%',
  },
  headerNavigation: {
    position: 'absolute',
    right: '1%',
  },
});
