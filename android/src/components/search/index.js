import React, { Component } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';

import historySearch from './historySearch';
import Result from './Result';
import {
  primaryBlue,
  smallFontSize,
  navBarContainerHeight,
  searchContainerHeight,
  resultContainerHeight,
  resultHeight,
  noResultContainerHeight,
  noResultHeight,
  windowCenterPoint,
  underlineWidth,
  separatorHeight,
 } from '../../styles/common';


/* global require */
export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      buttonOpacity: new Animated.Value(1),
      containerHeight: new Animated.Value(navBarContainerHeight),
      underlineMargin: new Animated.Value(windowCenterPoint),
      underlineOpacity: new Animated.Value(1),
      separatorHeight: new Animated.Value(0),
      underline: new Animated.Value(0),
      textFade: new Animated.Value(0),
      resultHeight: new Animated.Value(0),
      resultOpacity: new Animated.Value(0),
      license: '',
      result: null,
    }
    this.marginValue = windowCenterPoint;
  }

  render() {
    return (
      <Animated.View style={{
        zIndex: 10,
        height: this.state.containerHeight,
        alignSelf: 'stretch',
        backgroundColor: primaryBlue, }} >

        <View style={styles.headerContainer}>

        <TouchableHighlight
          onPress={ () => this._openSearch() }
          underlayColor={primaryBlue}
          style={styles.searchIcon} >
          <Image source={require('../../../../shared/images/search-icon.png')} />
        </TouchableHighlight>

          <Animated.View style={{
                            position: 'absolute',
                            top: '35%',
                            width: '30%',
                            marginLeft: this.state.underlineMargin,
                          }}>
            <TextInput
              ref={(ref) => { this.myTextInput = ref }}
              onChangeText={(license) => { this._handleTextInput(license) }}
              maxLength={7}
              fontSize={24}
              autoCapitalize={'characters'}
              keyboardType={'numeric'}
              autoCorrect={false}
              autoFocus={ this.props.timerList ? false : true }
              underlineColorAndroid={'transparent'}
              value={this.state.license} />
          </Animated.View>

          <TouchableHighlight
            onPress={ () => {
              Keyboard.dismiss();
              this.props.navigation.navigate('DrawerOpen')
            }}
            underlayColor={primaryBlue}
            style={styles.headerNavigation} >
            <Image source={require('../../../../shared/images/menu-icon.jpg')} />
          </TouchableHighlight>
        </View>


        <Animated.View style={{
                        alignSelf: 'center',
                        borderWidth: .35,
                        borderColor: 'white',
                        width: this.state.underline,
                        opacity: this.state.underlineOpacity, }}>
        </Animated.View>


        <Animated.View style={{
            opacity: this.state.buttonOpacity,
            // height: '8%',
            flex: 1,
            flexDirection: 'row', }} >

          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this._handleHistorySearch(this.state.license) }} >
            <Animated.Text style={{
              color: 'white',
              fontSize: smallFontSize,
              opacity: this.state.textFade, }}>History</Animated.Text>
          </TouchableOpacity>

          <Animated.View style={{
            borderColor: 'white',
            borderWidth: .35,
            height: this.state.separatorHeight, }} />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this._handleVINSearch(this.state.license) }} >
            <Animated.Text style={{
            color: 'white',
            fontSize: smallFontSize,
            opacity: this.state.textFade, }}>VIN</Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{
          opacity: this.state.resultOpacity,
          height: this.state.resultHeight,
          alignSelf: 'stretch',
          }}>
          { this.state.result ? <Result
                                  data={this.state.result}
                                  navigation={this.props.navigation}
                                  license={this.state.license}
                                  resizeMenuContainer={this.props.resizeMenuContainer ? this.props.resizeMenuContainer : null}
                                  minimizeResultContainer={this.minimizeResultContainer.bind(this)}
                                  closeSearch={this.props.closeSearch} /> : null }
        </Animated.View>

      </Animated.View>
    );
  }

  componentDidMount() {
    Animated.parallel([
      Animated.timing(
        this.state.underline,
        { toValue: underlineWidth,
          duration: 500 },
      ),
      Animated.timing(
        this.state.textFade,
        { toValue: 1,
          duration: 500, },
      ),
      Animated.timing(
        this.state.separatorHeight,
        { toValue: separatorHeight,
          duration: 250, },
      ),
      Animated.timing(
        this.state.containerHeight,
        { toValue: searchContainerHeight,
          duration: 500, },
      ),
    ]).start();
    if (this.props.timerList) this.keyboardDidHideForTimerListListener = Keyboard.addListener('keyboardDidHideForTimerList', this._keyboardDidHideForTimerList.bind(this));
    this._mounted = true;
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  _keyboardDidHide() {
    this.myTextInput.blur();
  }

  componentWillUnmount() {
    this._mounted = false;
    this.props.timerList && this.keyboardDidHideForTimerListListener.remove();
    this.keyboardDidHideListener.remove();
  }

  componentWillUpdate() {
    if (this.props.timerList) {
      if (this.props.shouldResetLicense()) {
        this.setState({license: '', underlineMargin: new Animated.Value(windowCenterPoint)});
        this.marginValue = windowCenterPoint;
        this.props.shouldResetLicense(true);
      }
    }
  }

  _openSearch() {
    this.state.result !== null && this.minimizeResultContainer();
    this.props.minimizeMenuContainer && this.props.minimizeMenuContainer();

    this.myTextInput.isFocused() && Keyboard.dismiss();

    this.props.timerList && this.myTextInput.focus();
    !this.props.timerList && Keyboard.dismiss();
    !this.props.timerList && this._fadeContainer();
    !this.props.timerList && setTimeout(() => this._mounted && this.props.closeSearch(), 500);

    this.setState({ license: '', underlineMargin: new Animated.Value(windowCenterPoint) });
    this.marginValue = windowCenterPoint;
  }

  _handleHistorySearch() {
    if (this.state.license.length === 0) {
      this.myTextInput.focus();
    } else {
      let prevResult = this.state.result;
      let result = historySearch(this.state.license);

      if (result === undefined && prevResult !== 'unfound') {

        this.noResultNotification(); // TODO QUICK FIX FOR EMPTY BLOCK -- Figure out what goes here!

      }

      result = result === undefined ? 'unfound' : result;
      this.setState({result});


      if (result !== 'unfound') {
        // Case for extending the container of Search in any component.
        this.extendResultContainer();

        // Case for extending the Menu container of Overview.
        this.props.resizeMenuContainer && this.props.resizeMenuContainer(true);
        Keyboard.dismiss();
      } else if (result === 'unfound') {
        this.props.noResultNotificationForMenu && this.props.noResultNotificationForMenu();
        this.noResultNotification();
      }

      // Add license to current Timer in queue in TimerList if in TimerList.
      this.props.timerList && this.props.addLicenseToQueue(this.state.license);
    }
  }

  _handleVINSearch() {
    if (this.state.license.length === 0) {
      this.myTextInput.focus();
    } else {

      this.props.timerList && this.props.addLicenseToQueue(this.state.license);
    }
  }

  noResultNotification() {
    Animated.parallel([
      Animated.timing(
        this.state.containerHeight, {
          toValue: noResultContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.state.resultHeight, {
          toValue: noResultHeight,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.state.resultOpacity, {
          toValue: 1,
          duration: 1000,
        },
      ),
    ]).start();

    setTimeout(() => {

      Animated.parallel([
        Animated.timing(
          this.state.containerHeight, {
            toValue: searchContainerHeight,
            duration: 600,
          },
        ),
        Animated.timing(
          this.state.resultHeight, {
            toValue: 0,
            duration: 400,
          },
        ),
        Animated.timing(
          this.state.resultOpacity, {
            toValue: 0,
            duration: 1000,
          },
        ),
      ]).start();
    }, 1800);
  }

  extendResultContainer() {
    Animated.parallel([
      Animated.timing(
        this.state.containerHeight, {
          toValue: resultContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.state.resultHeight, {
          toValue: resultHeight,//115,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.state.resultOpacity, {
          toValue: 1,
          duration: 1000,
        },
      ),
    ]).start();

  }

  minimizeResultContainer() {
    Animated.parallel([
      Animated.timing(
        this.state.containerHeight, {
          toValue: searchContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.state.resultHeight, {
          toValue: 0,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.state.resultOpacity, {
          toValue: 0,
          duration: 1000,
        },
      ),
    ]).start();
    Keyboard.dismiss();
    this.setState({license: '', result: null, underlineMargin: new Animated.Value(windowCenterPoint)});
  }

   _keyboardDidHideForTimerList() {
     if (this.state.license) this.props.addLicenseToQueue(this.state.license);
   }

  _handleTextInput(license: string) {
    if (license.length === 0) {
      Animated.timing(
        this.state.underlineMargin, {
          toValue: windowCenterPoint,
        },
      ).start();
      this.marginValue = windowCenterPoint;
      this.setState({license});
      return;
    }
    if (license.length < this.state.license.length) {
      this.marginValue += 6.65;
      Animated.timing(
        this.state.underlineMargin, {
          toValue: this.marginValue,
        },
      ).start();
    } else {
      this.marginValue -= 6.65;
      Animated.timing(
        this.state.underlineMargin, {
          toValue: this.marginValue,
        },
      ).start();
    }
    this.setState({license});
  }

  _fadeContainer() {
    Animated.parallel([
      Animated.timing(
        this.state.buttonOpacity,{
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.state.containerHeight,{
          toValue: navBarContainerHeight,
          duration: 700,
        },
      ),
      Animated.timing(
        this.state.underlineOpacity,{
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.state.underline,{
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.state.resultOpacity,{
          toValue: 0,
          duration: 700,
        },
      ),
    ]).start();
  }

}

Search.propTypes = {
  navigation: PropTypes.object.isRequired,
  timerList: PropTypes.bool,
  shouldResetLicense: PropTypes.func,
  minimizeResultContainer: PropTypes.func,
  minimizeMenuContainer: PropTypes.func,
  resizeMenuContainer: PropTypes.func,
  noResultNotificationForMenu: PropTypes.func,
  closeSearch: PropTypes.func,
  addLicenseToQueue: PropTypes.func,
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchIcon: {
    marginTop: '1%',
  },
  headerNavigation: {
    position: 'absolute',
    right: 1,
  },
  button: {
    flex: .5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
