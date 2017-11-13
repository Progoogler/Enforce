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

import MainButtons from './MainButtons';
import Search from '../search';
import {
  blueTextShadow,
  noResultContainerHeight,
  primaryBlue,
  resultContainerHeight,
  searchContainerHeight,
  titleFontSize,
  verificationContainerHeight,
 } from '../../styles/common';

/* global require */
export default class Menu extends Component {
  constructor() {
    super();
    this.buttonOpacity = new Animated.Value(1);
    this.closeSearch = this.closeSearch.bind(this);
    this.containerHeight = new Animated.Value(searchContainerHeight);
    this.containerOpacity = new Animated.Value(1);
    this.hideNoResultNotificationForMenu = this.hideNoResultNotificationForMenu.bind(this);
    this.mounted = false;
    this.resizeMenuContainer = this.resizeMenuContainer.bind(this);
    this.showNoResultNotificationForMenu = this.showNoResultNotificationForMenu.bind(this);
    this.titleOpacity = new Animated.Value(0);
    this.toggleVerifyContainerForMenu = this.toggleVerifyContainerForMenu.bind(this);
    this.state = {
      search: false,
    };
  }

  render() {
    return (

      <Animated.View 
        style={{
          alignSelf: 'stretch',
          backgroundColor: primaryBlue,
          height: this.containerHeight,
        }}
      >
      {

        this.state.search ?

        <Search 
          closeSearch={this.closeSearch}
          hideNoResultNotificationForMenu={this.hideNoResultNotificationForMenu} 
          navigation={this.props.navigation} 
          resizeMenuContainer={this.resizeMenuContainer} 
          showNoResultNotificationForMenu={this.showNoResultNotificationForMenu} 
          toggleVerifyContainerForMenu={this.toggleVerifyContainerForMenu}
          refPath={this.props.refPath}
        /> 
        
        :
        
        <View>
          <View style={styles.headerContainer}>
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
                  )
                ]).start();
                this.mounted && this.setState({search: !this.state.search});
              }}
              style={styles.searchIcon}
              underlayColor={primaryBlue}
            >
              <Image source={require('../../images/search-icon.png')}/>
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
                }
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
              <Image source={require('../../images/menu-icon.jpg')}/>
            </TouchableHighlight>
          </View>
          <Animated.View 
            style={{ 
              opacity: this.buttonOpacity, 
              marginTop: '2%', 
            }}
          >
            <MainButtons navigation={this.props.navigation}/>
          </Animated.View>
        </View>
      }
      </Animated.View>
    );
  }

  componentDidMount() {
    this.mounted = true;
    Animated.timing(
      this.titleOpacity, { 
        toValue: 1,
        duration: 500
      }
    ).start();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.search !== nextState.search) return true;
    if (this.props.title !== nextProps.title) return true;
    if (this.props.refPath !== nextProps.refPath) return true;
    return false;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  resizeMenuContainer(extend: boolean) {
    if (extend) {
      Animated.timing(
        this.containerHeight, { 
          toValue: resultContainerHeight,
          duration: 500
        }
      ).start();
    } else {
      Animated.timing(
        this.containerHeight, { 
          toValue: searchContainerHeight,
          duration: 500
        }
      ).start();
    }
  }

  showNoResultNotificationForMenu() {
    Animated.timing(
      this.containerHeight, {
        toValue: noResultContainerHeight,
        duration: 600
      }
    ).start();
  }

  hideNoResultNotificationForMenu() {
    Animated.timing(
      this.containerHeight, {
        toValue: searchContainerHeight,
        duration: 600
      }
    ).start();
  }

  toggleVerifyContainerForMenu(open?: string) {
    if (open) {
      Animated.timing(
        this.containerHeight, {
          toValue: verificationContainerHeight,
          duration: 600
        }
      ).start();
    } else {
      Animated.timing(
        this.containerHeight, {
          toValue: searchContainerHeight,
          duration: 1000
        }
      ).start();
    }
  }

  closeSearch() {
    this.mounted && this.setState({ search: !this.state.search });
    Animated.parallel([
      Animated.timing(
        this.titleOpacity, { 
          toValue: 1,
          duration: 1000 
        }
      ),
      Animated.timing(
        this.buttonOpacity, { 
          toValue: 1,
          duration: 1000 
        }
      ),
      Animated.timing(
        this.containerHeight, { 
          toValue: searchContainerHeight,
          duration: 350
        }
      ),
    ]).start();
  }
}

Menu.propTypes = {
  navigation: PropTypes.object.isRequired,
  refPath: PropTypes.string,
  title: PropTypes.string,
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '2%',
  },
  searchIcon: {
    marginLeft: '2%',
  },
  headerNavigation: {
    position: 'absolute',
    right: '1%',
  },
});
