import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import { titleFontSize, primaryBlue, blueTextShadow, navigationBarHeight } from '../styles/common';

/* global require */
export default class StaticNavigation extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container} >
        <TouchableWithoutFeedback style={styles.back} onPress={() => this._handleArrow()} >
          <Image
            style={styles.icon}
            source={require('../../../../shared/images/backarrow.jpg')} />
        </TouchableWithoutFeedback>
        <Text style={styles.title}>{ this.props.title ? this.props.title : 'Enforce' }</Text>

        { this.props.navigation ?
        <TouchableHighlight
          underlayColor={primaryBlue}
          onPress={ () => {
            this.props.navigation.navigate('DrawerOpen');
          }}
          style={styles.headerNavigation} >
          <Image source={require('../../../../shared/images/menu-icon.jpg')} />
        </TouchableHighlight>
        : null }

      </View>
    );
  }

  _handleArrow() {
    this.props.navigation && this.props.navigation.navigate('Overview');
    !this.props.navigation && this.props.closeModal();
  }

}

StaticNavigation.propTypes = {
  navigation: PropTypes.object,
  title: PropTypes.string.isRequired,
  closeModal: PropTypes.func,
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryBlue,
    height: navigationBarHeight,
  },
  icon: {
    marginLeft: '4%',
  },
  title: {
    flex: .70,
    fontSize: titleFontSize,
    marginLeft: '5%',
    color: 'white',
    textAlignVertical: 'center',
    textShadowColor: blueTextShadow,
    textShadowOffset: {
      width: 2,
      height: 1
    },
  },
  headerNavigation: {
    flex: .15,
    position: 'absolute',
    right: '1%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
