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
import { primaryBlue, blueTextShadow, titleFontSize } from '../styles/common';

/* global require */
export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      containerHeight: new Animated.Value(130),
      containerOpacity: new Animated.Value(1),
      buttonOpacity: new Animated.Value(1),
      titleOpacity: new Animated.Value(0),
      search: false,
    };
  }

  render() {
    return (

      <Animated.View style={{
        height: this.state.containerHeight,
        alignSelf: 'stretch',
        backgroundColor: primaryBlue,
      }}>
      {

        this.state.search ?

        <Search navigation={this.props.navigation} noResultNotificationForMenu={this.noResultNotificationForMenu.bind(this)} resizeMenuContainer={this.resizeMenuContainer.bind(this)} closeSearch={this.closeSearch.bind(this)}/> :

        <View>
          <View style={styles.headerContainer} >
            <TouchableHighlight
              onPress={() => {
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
                this._mounted && this.setState({
                  search: !this.state.search,
                  titleOpacity: new Animated.Value(0),
                  buttonOpacity: new Animated.Value(0),
                });
              }}
              underlayColor={primaryBlue}
              style={styles.searchIcon} >
              <Image source={require('../../../../shared/images/search-icon.png')} />
            </TouchableHighlight>
            <Animated.Text style={{
              opacity: this.state.titleOpacity,
              flex: .70,
              fontSize: titleFontSize,
              color: 'white',
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
          <Animated.View style={{ opacity: this.state.buttonOpacity, marginTop: '2%', }} >
            <MainButtons navigation={this.props.navigation} searching={this.state.search} />
          </Animated.View>
        </View>
      }
      </Animated.View>
    );
  }

  componentDidMount() {
    Animated.timing(
      this.state.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
    this._mounted = true;
    setTimeout(() => this._mounted && this.setState({ titleOpacity: new Animated.Value(1) }), 550);
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  resizeMenuContainer(extend: boolean) {
    if (extend) {
      Animated.timing(
        this.state.containerHeight,
        { toValue: 250,
          duration: 500, },
        ).start();
      } else {
        Animated.timing(
          this.state.containerHeight,
          { toValue: 120,
            duration: 500, },
        ).start();
      }
    }

    noResultNotificationForMenu() {
      Animated.timing(
        this.state.containerHeight, {
          toValue: 200,
          duration: 600,
        },
      ).start();

      setTimeout(() => {
        Animated.timing(
          this.state.containerHeight, {
            toValue: 120,
            duration: 600,
          },
        ).start();
      }, 1800);
    }

  closeSearch() {
    this._mounted && this.setState({ search: !this.state.search });
    Animated.parallel([
      Animated.timing(
        this.state.titleOpacity,
        { toValue: 1,
          duration: 1000, },
      ),
      Animated.timing(
        this.state.buttonOpacity,
        { toValue: 1,
          duration: 1000, },
      ),
      Animated.timing(
        this.state.containerHeight,
        { toValue: 130,
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
  },
  searchIcon: {
    marginTop: '1%',
    marginRight: '5%',
  },
  headerNavigation: {
    flex: .15,
    position: 'absolute',
    right: '1%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
