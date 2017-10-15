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

  render() { console.log('navigation index')
    return (

      <View style={styles.container}>
      {

        this.state.search ?

        <Search
          closeSearch={this.closeSearch.bind(this)}
          displayFirebaseResult={this.props.displayFirebaseResult}
          historyScreen={this.props.historyScreen} 
          navigation={this.props.navigation}
          refPath={this.props.refPath}
        /> 
        
        :

        <View style={styles.headerContainer} >
          <TouchableHighlight
            onPress={ () => {
              Animated.timing(
                this.titleOpacity, { 
                  toValue: 0,
                  duration: 500, 
                }
              ).start();
              this.props.toggleSearching ? this.props.toggleSearching() : null;
              this.setState({ search: !this.state.search });
            }}
            style={styles.searchIcon}
            underlayColor={primaryBlue}
          >
            <Image source={require('../../../../shared/images/search-icon.png')}/>
          </TouchableHighlight>
          <Animated.Text 
            style={{
              color: 'white',
              flex: .70,
              fontSize: titleFontSize,
              marginLeft: '2%',
              opacity: this.titleOpacity,
              textAlignVertical: 'center',
              textShadowColor: blueTextShadow,
              textShadowOffset: {
                width: 2,
                height: 1
              },
            }}
          >
            { this.props.title ? this.props.title : 'Enforce' }
          </Animated.Text>
          <TouchableHighlight
            onPress={ () => {
              Keyboard.dismiss();
              this.props.navigation.navigate('DrawerOpen');
            }}
            style={styles.headerNavigation}
            underlayColor={primaryBlue}
          >
            <Image source={require('../../../../shared/images/menu-icon.jpg')}/>
          </TouchableHighlight>
        </View>
      }
      </View>
    );
  }

  componentDidMount() {
    this.props.search && this.setState({ search: true });
    Animated.timing(
      this.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.search !== nextState.search) return true;
    if (this.props.title !== nextProps.title) return true;
    return false;
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
  historyScreen: PropTypes.bool,
  navigation: PropTypes.object.isRequired,
  refPath: PropTypes.string.isRequired,
  search: PropTypes.bool,
  title: PropTypes.string,
  toggleSearching: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: primaryBlue,
    zIndex: 11,
  },
  headerContainer: {
    height: navBarContainerHeight,
    flexDirection: 'row',
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
