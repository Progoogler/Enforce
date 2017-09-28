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
import Realm from 'realm';

import CheckSearchTypeModal from './CheckSearchTypeModal';
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
      license: '',
      result: null,
      showTypeOfSearchModal: false,
    }
    this.realm = new Realm();
    this.marginValue = windowCenterPoint;
    this.buttonOpacity = new Animated.Value(1);
    this.containerHeight = new Animated.Value(searchContainerHeight);
    this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
    this.underlineOpacity = new Animated.Value(1);
    this.separatorHeight = new Animated.Value(0);
    this.underline = new Animated.Value(0);
    this.textFade = new Animated.Value(0);
    this.resultHeight = new Animated.Value(0);
    this.resultOpacity = new Animated.Value(0);
  }

  render() {
    return (
      <Animated.View style={{
        zIndex: 10,
        height: this.containerHeight,
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
              top: '35%', // TODO Fix this percentage into a responsive percentage of height of device
              width: '30%',
              marginLeft: this.cursorMarginLeft,
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
            width: this.underline,
            opacity: this.underlineOpacity,
        }}/>

        <Animated.View style={{
            opacity: this.buttonOpacity,
            flex: 1,
            flexDirection: 'row', }} >

          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this._handleHistorySearch(this.state.license) }} >
            <Animated.Text style={{
              color: 'white',
              fontSize: smallFontSize,
              opacity: this.textFade, }}>History</Animated.Text>
          </TouchableOpacity>

          <Animated.View style={{
            borderColor: 'white',
            borderWidth: .35,
            height: this.separatorHeight, }} />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this._handleVINSearch(this.state.license) }} >
            <Animated.Text style={{
            color: 'white',
            fontSize: smallFontSize,
            opacity: this.textFade, }}>VIN</Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{
          opacity: this.resultOpacity,
          height: this.resultHeight,
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

        { this.state.showTypeOfSearchModal ? <CheckSearchTypeModal handleHistorySearchWith={this.handleHistorySearchWith.bind(this)}/> : null }

      </Animated.View>
    );
  }

  componentDidMount() {
    Animated.parallel([
      Animated.timing(
        this.underline,
        { toValue: underlineWidth,
          duration: 500 },
      ),
      Animated.timing(
        this.textFade,
        { toValue: 1,
          duration: 500, },
      ),
      Animated.timing(
        this.separatorHeight,
        { toValue: separatorHeight,
          duration: 250, },
      ),
      Animated.timing(
        this.containerHeight,
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
      } else if (this.props.licenseParam.license !== nextProps.licenseParam.license) {
        this.marginValue = windowCenterPoint;
        let license = nextProps.licenseParam.license;
        this.marginValue -= license.length * textInputOffset;
        this.setState({license});
        Animated.timing(
          this.cursorMarginLeft, {
            toValue: this.marginValue,
          },
        ).start();
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

  handleHistorySearchWith(type) {
    if (type === 'license') {
      this._handleHistorySearch(this.state.license, 'license');
    } else if (type === 'VIN') {
      this._handleHistorySearch(this.state.license, 'VIN');
    }
    this.setState({showTypeOfSearchModal: false});
  }

  _checkForTypeOfSearch() {
    this._mounted && this.setState({showTypeOfSearchModal: true});
  }

  // Look through the history of Realm ( TODO: and Firebase??) for a record
  // @PARAM typeOfSearch - Signfy the difference between a VIN and license when input is 4 characters long
  _handleHistorySearch(license: string, typeOfSearch: string) { console.log('len', this.state.license.length, !typeOfSearch, typeOfSearch)

    if (license.length === 0) {
      this.myTextInput.focus();
      return;
    } else if (license.length === 4 && typeOfSearch === undefined) { console.log('why return?')

      this._checkForTypeOfSearch();
      return;

    } else {
      let result;
      let prevResult = this.state.result;

      if (typeOfSearch === 'VIN') {
        result = historySearch(license, "vinSearch");
      } else {
        result = historySearch(license);
      }

      if (result === undefined && prevResult !== 'unfound') {
        this._noResultNotification(); // TODO QUICK FIX FOR EMPTY BLOCK -- Figure out what goes here!
      }

      result = result === undefined ? 'unfound' : result;
      this.setState({result});


      if (result !== 'unfound') {
        // Case for extending the container of Search in any component.
        this._extendResultContainer();
        // Case for extending the Menu container of Overview.
        this.props.resizeMenuContainer && this.props.resizeMenuContainer(true);
        Keyboard.dismiss();

      } else if (result === 'unfound') {
        this.props.noResultNotificationForMenu && this.props.noResultNotificationForMenu();
        this._noResultNotification();
      }

      // Add license to current Timer in queue in TimerList if in TimerList.
      if (this.props.timerList) {
        if (!this.props.licenseParam.license) {
          this.props.addLicenseToQueue(license); // TODO Decide if a historySearch() press should warrant adding license to queue
        } else {
          this._updateLicenseOfTimer();
        }
      }
    }
  }

  _handleVINSearch() {
    if (this.state.license.length === 0) {
      this.myTextInput.focus();
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
    var timerList = this.realm.objects('Timers')[this.props.licenseParam.listIndex].list;
    for (let i = 0; i < timerList.length; i++) {
      if (timerList[i].license === this.props.licenseParam.license) {
        this.realm.write(() => {
        timerList[i].license = this.state.license;
        });
      }
    }
    this.props.refreshTimerList();
  }

  _noResultNotification() {
    Animated.parallel([
      Animated.timing(
        this.containerHeight, {
          toValue: noResultContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.resultHeight, {
          toValue: noResultHeight,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.resultOpacity, {
          toValue: 1,
          duration: 1000,
        },
      ),
    ]).start();

    setTimeout(() => {

      Animated.parallel([
        Animated.timing(
          this.containerHeight, {
            toValue: searchContainerHeight,
            duration: 600,
          },
        ),
        Animated.timing(
          this.resultHeight, {
            toValue: 0,
            duration: 400,
          },
        ),
        Animated.timing(
          this.resultOpacity, {
            toValue: 0,
            duration: 1000,
          },
        ),
      ]).start();
    }, 1800);
  }

  __extendResultContainer() {
    Animated.parallel([
      Animated.timing(
        this.containerHeight, {
          toValue: resultContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.resultHeight, {
          toValue: resultHeight,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.resultOpacity, {
          toValue: 1,
          duration: 1000,
        },
      ),
    ]).start();

  }

  minimizeResultContainer() {
    Animated.parallel([
      Animated.timing(
        this.containerHeight, {
          toValue: searchContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.resultHeight, {
          toValue: 0,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.resultOpacity, {
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

  _handleTextInput(license: string) { console.log('handle text input:', license, 'state.license:', this.state.license);
    if (license.length === 0) {
      Animated.timing(
        this.cursorMarginLeft, {
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
        this.cursorMarginLeft, {
          toValue: this.marginValue,
        },
      ).start();
    } else {
      this.marginValue -= textInputOffset;
      Animated.timing(
        this.cursorMarginLeft, {
          toValue: this.marginValue,
        },
      ).start();
    }
    this.setState({license});
  }

  _fadeContainer() {
    Animated.parallel([
      Animated.timing(
        this.buttonOpacity,{
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.containerHeight,{
          toValue: searchContainerHeight,
          duration: 700,
        },
      ),
      Animated.timing(
        this.underlineOpacity,{
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.underline,{
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.resultOpacity,{
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
