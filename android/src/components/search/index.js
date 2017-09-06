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
  searchContainerHeight,
  resultContainerHeight,
  resultHeight,
  noResultContainerHeight,
  noResultHeight,
  windowCenterPoint,
  underlineWidth,
  separatorHeight,
  textInputOffset,
 } from '../../styles/common';


/* global require */
export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      buttonOpacity: new Animated.Value(1),
      containerHeight: new Animated.Value(searchContainerHeight),
      cursorMarginLeft: new Animated.Value(windowCenterPoint),
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

          <Animated.View
            style={{
              position: 'absolute',
              top: '35%',
              width: '30%',
              marginLeft: this.state.cursorMarginLeft,
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


        <Animated.View
          style={{
            alignSelf: 'center',
            borderWidth: .35,
            borderColor: 'white',
            width: this.state.underline,
            opacity: this.state.underlineOpacity,
        }}/>

        <Animated.View style={{
            opacity: this.state.buttonOpacity,
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
          { this.state.result ?

            <Result
              data={this.state.result}
              navigation={this.props.navigation}
              license={this.state.license}
              resizeMenuContainer={this.props.resizeMenuContainer ? this.props.resizeMenuContainer : null}
              minimizeResultContainer={this.minimizeResultContainer.bind(this)}
              closeSearch={this.props.closeSearch} />

              :

            null
          }
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

  componentWillReceiveProps(nextProps) {
    if (this.props.timerList) {
      if (this.props.shouldResetLicense()) {
        this.setState({license: '', cursorMarginLeft: new Animated.Value(windowCenterPoint)});
        this.marginValue = windowCenterPoint;
        this.props.shouldResetLicense(true); // Sets the return value of this._reset to false in TimerList to prevent resetting the search field until a uponTicketed() or expiredFunc() is performed.
      } else if (this.props.licenseParam.pressed !== nextProps.licenseParam.pressed ||
        (this.props.licenseParam.pressed === 0 && this.props.licenseParam.license !== nextProps.licenseParam.license)) {
        this.setState({license: '', cursorMarginLeft: new Animated.Value(windowCenterPoint)});
        this.marginValue = windowCenterPoint;
        let license = nextProps.licenseParam.license;
        this.marginValue = this.marginValue - (license.length * textInputOffset);
        this.setState({license, cursorMarginLeft: new Animated.Value(this.marginValue)});
      }
    }
  }

  _openSearch() {
    this.state.result !== null && this.minimizeResultContainer();
    this.props.minimizeMenuContainer && this.props.minimizeMenuContainer();

    if (this.props.timerList) {
      if (this.state.license.length > 0 && this.myTextInput.isFocused()) {
        this.setState({ license: '', cursorMarginLeft: new Animated.Value(windowCenterPoint) });
        this.marginValue = windowCenterPoint;
        Keyboard.dismiss();
      } else if (this.myTextInput.isFocused()) {
        Keyboard.dismiss();
      } else if (!this.myTextInput.isFocused()) {
        this.myTextInput.focus();
      }

      return;
    }
    this.myTextInput.isFocused() && Keyboard.dismiss();
    this._fadeContainer();
    setTimeout(() => this._mounted && this.props.closeSearch(), 500);

    this.setState({ license: '', cursorMarginLeft: new Animated.Value(windowCenterPoint) });
    this.marginValue = windowCenterPoint;
  }

  _handleHistorySearch() {

    if (this.state.license.length === 0) {
      this.myTextInput.focus();
      return;
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
      if (this.props.timerList) {
        if (!this.props.licenseParam.license) {
          this.props.addLicenseToQueue(this.state.license); // TODO Decide if a historySearch() press should warrant adding license to queue
        } else {
          this._updateLicenseOfTimer();
        }
      }
    }
  }

  _handleVINSearch() {
    if (this.state.license.length === 0) {
      this.myTextInput.focus();
      return;
    } else if (this.props.timerList) {
      // Add license to current Timer in queue in TimerList if in TimerList.
      if (!this.props.licenseParam.license) {
        this.props.addLicenseToQueue(this.state.license);
      } else {
        this._updateLicenseOfTimer();
      }
    }
  }

  _updateLicenseOfTimer() {
    var timerList = this.props.realm.objects('Timers')[this.props.licenseParam.listIndex].list;
    for (let i = 0; i < timerList.length; i++) {
      if (timerList[i].license === this.props.licenseParam.license) {
        this.props.realm.write(() => {
        timerList[i].license = this.state.license;
        });
      }
    }
    this.props.refreshTimerList();
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
    this.setState({license: '', result: null, cursorMarginLeft: new Animated.Value(windowCenterPoint)});
  }

   _keyboardDidHideForTimerList() {
     if (this.state.license) this.props.addLicenseToQueue(this.state.license);
   }

  _handleTextInput(license: string) {
    if (license.length === 0) {
      Animated.timing(
        this.state.cursorMarginLeft, {
          toValue: windowCenterPoint,
        },
      ).start();
      this.marginValue = windowCenterPoint;
      this.setState({license});
      return;
    }
    if (license.length < this.state.license.length) {
      this.marginValue += textInputOffset;
      Animated.timing(
        this.state.cursorMarginLeft, {
          toValue: this.marginValue,
        },
      ).start();
    } else {
      this.marginValue -= textInputOffset;
      Animated.timing(
        this.state.cursorMarginLeft, {
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
          toValue: searchContainerHeight,
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
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: '2%',
  },
  headerNavigation: {
    position: 'absolute',
    right: '1%',
  },
  button: {
    flex: .5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
