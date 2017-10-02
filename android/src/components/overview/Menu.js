import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  Image,
  Keyboard,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';

import MainButtons from './MainButtons';
import Search from '../search';
import {
  primaryBlue,
  blueTextShadow,
  titleFontSize,
  searchContainerHeight,
  resultContainerHeight,
  noResultContainerHeight,
  verificationContainerHeight,
 } from '../../styles/common';

/* global require */
export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      search: false,
    };
    this.containerHeight = new Animated.Value(searchContainerHeight);
    this.containerOpacity = new Animated.Value(1);
    this.buttonOpacity = new Animated.Value(1);
    this.titleOpacity = new Animated.Value(0);
  }

  render() {
    return (

      <Animated.View style={{
        height: this.containerHeight,
        alignSelf: 'stretch',
        backgroundColor: primaryBlue,
      }}>
      {

        this.state.search ?

        <Search 
          navigation={this.props.navigation} 
          noResultNotificationForMenu={this.noResultNotificationForMenu.bind(this)} 
          resizeMenuContainer={this.resizeMenuContainer.bind(this)} 
          toggleVerifyContainer={this.toggleVerifyContainer.bind(this)}
          closeSearch={this.closeSearch.bind(this)}/> :

        <View>
          <View style={styles.headerContainer} >
            <TouchableHighlight
              onPress={() => {
                Animated.parallel([
                  Animated.timing(
                    this.titleOpacity,
                    { toValue: 0,
                      duration: 500, },
                  ),
                  Animated.timing(
                    this.buttonOpacity,
                    { toValue: 0,
                      duration: 500, },
                  ),
                ]).start();
                this._mounted && this.setState({search: !this.state.search});
              }}
              underlayColor={primaryBlue}
              style={styles.searchIcon} >
              <Image source={require('../../../../shared/images/search-icon.png')} />
            </TouchableHighlight>
            <Animated.Text style={{
              opacity: this.titleOpacity,
              flex: .70,
              fontSize: titleFontSize,
              color: 'white',
              marginLeft: '2%',
              textAlignVertical: 'center',
              textShadowColor: blueTextShadow,
              textShadowOffset: {
                width: 2,
                height: 1
              },
            }}>

            { this.props.title ? this.props.title : 'Enforce' }

            </Animated.Text>
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
          <Animated.View style={{ opacity: this.buttonOpacity, marginTop: '2%', }} >
            <MainButtons navigation={this.props.navigation} searching={this.state.search} />
          </Animated.View>
        </View>
      }
      </Animated.View>
    );
  }

  componentDidMount() {
    this._mounted = true;
    Animated.timing(
      this.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  resizeMenuContainer(extend: boolean) {
    if (extend) {
      Animated.timing(
        this.containerHeight, { 
          toValue: resultContainerHeight,
          duration: 500, 
        },
      ).start();
    } else {
      Animated.timing(
        this.containerHeight, { 
          toValue: searchContainerHeight,
          duration: 500, 
        },
      ).start();
    }
  }

  noResultNotificationForMenu() {
    Animated.timing(
      this.containerHeight, {
        toValue: noResultContainerHeight,
        duration: 600,
      },
    ).start();

    setTimeout(() => {
      Animated.timing(
        this.containerHeight, {
          toValue: searchContainerHeight,
          duration: 600,
        },
      ).start();
    }, 1800);
  }

  toggleVerifyContainer(open) {
    if (open) {
      Animated.timing(
        this.containerHeight, {
          toValue: verificationContainerHeight,
          duration: 600,
        },
      ).start();
    } else {
      Animated.timing(
        this.containerHeight, {
          toValue: searchContainerHeight,
          duration: 1000,
        },
      ).start();
    }
  }

  closeSearch() {
    this._mounted && this.setState({ search: !this.state.search });
    Animated.parallel([
      Animated.timing(
        this.titleOpacity,
        { toValue: 1,
          duration: 1000, },
      ),
      Animated.timing(
        this.buttonOpacity,
        { toValue: 1,
          duration: 1000, },
      ),
      Animated.timing(
        this.containerHeight,
        { toValue: searchContainerHeight,
          duration: 350, },
      ),
    ]).start();
  }
}

Menu.propTypes = {
  navigation: PropTypes.object.isRequired,
  title: PropTypes.string,
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '2%'
  },
  searchIcon: {
    marginLeft: '2%',
  },
  headerNavigation: {
    position: 'absolute',
    right: '1%',
  },
});
