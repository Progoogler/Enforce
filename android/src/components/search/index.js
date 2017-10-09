import React, { Component } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Realm from 'realm';

import historySearch from './historySearch';
import Result from './Result';
import VerifyModal from './Verify';
import {
  noResultContainerHeight,
  noResultHeight,
  primaryBlue,
  resultContainerHeight,
  resultHeight,
  searchContainerHeight,
  separatorHeight,
  smallFontSize,
  textInputOffset,
  underlineWidth,
  verificationContainerHeight,
  windowCenterPoint,
 } from '../../styles/common';


/* global require */
export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      license: '',
      result: null,
    }
    this.buttonOpacity = new Animated.Value(1);
    this.containerHeight = new Animated.Value(searchContainerHeight);
    this.containerOpacity = new Animated.Value(0);
    this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
    this.marginValue = windowCenterPoint;
    this.mounted = false;
    this.realm = new Realm();
    this.resultHeight = new Animated.Value(0);
    this.separatorHeight = new Animated.Value(0);
    this.textFade = new Animated.Value(0);
    this.underline = new Animated.Value(0);
    this.underlineOpacity = new Animated.Value(1);
    this.verifyHeight = new Animated.Value(0);
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
              onChangeText={(license) => { this.handleTextInput(license) }}
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
            height: this.separatorHeight, }} 
          />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this.handleVINSearch(this.state.license) }} >
            <Animated.Text style={{
            color: 'white',
            fontSize: smallFontSize,
            opacity: this.textFade, }}>VIN</Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={{
            opacity: this.containerOpacity,
            height: this.resultHeight,
            alignSelf: 'stretch',
          }}
        >
          { this.state.result ?

            <Result
              data={this.state.result}
              navigation={this.props.navigation}
              license={this.state.license}
              resizeMenuContainer={this.props.resizeMenuContainer ? this.props.resizeMenuContainer : null}
              minimizeResultContainer={this.minimizeResultContainer.bind(this)}
              closeSearch={this.props.closeSearch} 
            /> : null
          }
        </Animated.View>

        <Animated.View 
          style={{
            opacity: this.containerOpacity,
            height: this.verifyHeight,
            alignSelf: 'stretch',
          }}
        >

          <VerifyModal 
            handleTextInput={this.handleTextInput.bind(this)}
            handleVINSearch={this.handleVINSearch.bind(this)}
            license={this.state.license}
            minimizeVerifyContainer={this.minimizeVerifyContainer.bind(this)}
            minimizeVerifyContainerForMenu={this.props.toggleVerifyContainer}
          /> 
      
        </Animated.View>

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
    this.mounted = true;
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  _keyboardDidHide() {
    this.myTextInput.blur();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.timerList && this.keyboardDidHideForTimerListListener.remove();
    this.keyboardDidHideListener.remove();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.timerList) {
      if (this.props.shouldResetLicense()) {
        this.setState({license: ''});
        this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
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
        this.setState({ license: '' });
        this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
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
    setTimeout(() => this.mounted && this.props.closeSearch(), 500);

    this.setState({ license: '' });
    this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
    this.marginValue = windowCenterPoint;
  }

  // Look through the history of Realm ( TODO: and Firebase??) for a record
  // @PARAM typeOfSearch - Signfy the difference between a VIN and license when input is 4 characters long
  _handleHistorySearch(license: string) {
    
    var vinCheck;
    if (license.length === 4) {
      vinCheck = parseInt(license) + '';
      vinCheck = vinCheck.length === 4 ? true : false;
    }

    if (license.length === 0) {
      this.myTextInput.focus();
      return;
    } else {
      
      if (vinCheck) {
        historySearch(license, "vinSearch", this.historyResultCallback.bind(this));
      } else {
        historySearch(license, false, this.historyResultCallback.bind(this));
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

  historyResultCallback(result) {
    if (result === undefined) {
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
  }

  handleVINSearch(license: string, state: string, verified: boolean) {

    // TODO Delegate this to error callback of API
    // Remove automatic opening of Verify after Autocheck API is implemented
    if (this.props.toggleVerifyContainer) this.props.toggleVerifyContainer('open');
    this._extendVerifyContainer();

    if (verified) {
      if (license && license.length === 0) return;
    } else {
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
        this.containerOpacity, {
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
          this.containerOpacity, {
            toValue: 0,
            duration: 1000,
          },
        ),
      ]).start();
    }, 1800);
  }

  _extendVerifyContainer() {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(
        this.containerHeight, {
          toValue: verificationContainerHeight,
          duration: 600,
        },
      ),
      Animated.timing(
        this.verifyHeight, {
          toValue: verificationContainerHeight,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.containerOpacity, {
          toValue: 1,
          duration: 1000,
        },
      ),
    ]).start();
  }

  minimizeVerifyContainer(updatedLicense) {
    Animated.parallel([
      Animated.timing(
        this.containerHeight, {
          toValue: searchContainerHeight,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.verifyHeight, {
          toValue: 0,
          duration: 1000,
        },
      ),
      Animated.timing(
        this.containerOpacity, {
          toValue: 0,
          duration: 1000,
        },
      ),
    ]).start();
  }

  _extendResultContainer() {
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
        this.containerOpacity, {
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
        this.containerOpacity, {
          toValue: 0,
          duration: 1000,
        },
      ),
    ]).start();
    Keyboard.dismiss();
    this.setState({license: '', result: null});
    this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
    this.marginValue = windowCenterPoint;
  }

   _keyboardDidHideForTimerList() {
     if (this.state.license) this.props.addLicenseToQueue(this.state.license);
   }

  handleTextInput(license: string) {
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

    if (/\W/.test(license)) return;

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
        this.containerOpacity,{
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
  toggleVerifyContainer: PropTypes.func,
  addLicenseToQueue: PropTypes.func,
  refreshTimerList: PropTypes.func,
  licenseParam: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
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
