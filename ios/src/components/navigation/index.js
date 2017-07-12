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

import Search from '../search';
import {
  titleFontSize,
  primaryBlue,
  blueTextShadow,
  navBarContainerHeight,
} from '../../styles/common';

/* global require */
export default class Navigation extends Component {
  constructor() {
    super();
    this.state = {
      titleOpacity: new Animated.Value(0),
      search: false,
    };
  }

  render() {
    return (

      <View style={styles.container}>
      {

        this.state.search ?

        <Search
          navigation={this.props.navigation}
          closeSearch={this.closeSearch.bind(this)}
          defaultSearch={this.props.search}
          handleVINSearch={this.props.handleVINSearch ? this.props.handleVINSearch : null} /> :

        <View style={styles.headerContainer} >
          <TouchableHighlight
            onPress={ () => {
              Animated.timing(
                this.state.titleOpacity,
                { toValue: 0,
                  duration: 500, },
              ).start();
              this.props.toggleSearching ? this.props.toggleSearching() : null;
              this.setState({
                search: !this.state.search,
                titleOpacity: new Animated.Value(0),
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
      this.state.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
    setTimeout(() => this.setState({ titleOpacity: new Animated.Value(1) }), 550);
  }

  closeSearch() {
    this.setState({ search: !this.state.search });
    Animated.timing(
      this.state.titleOpacity,
      { toValue: 1,
        duration: 500, },
    ).start();
  }
}

Navigation.propTypes = {
  navigation: PropTypes.object.isRequired,
  handleVINSearch: PropTypes.func,
  toggleSearching: PropTypes.func,
  title: PropTypes.string,
  search: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: primaryBlue,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: navBarContainerHeight,
  },
  searchIcon: {
    marginTop: '1%',
    flex: .15,
  },
  headerNavigation: {
    flex: .15,
    position: 'absolute',
    right: '1%',
  },
});
