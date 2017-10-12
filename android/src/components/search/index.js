import React, { Component } from 'react';
import {
  ActivityIndicator,
  Animated,
  AsyncStorage,
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

import { getLicenseHistory } from '../../../../includes/firebase/database';
import historySearch from './historySearch';
import Result from './Result';
import VerifyModal from './Verify';
import {
  navBarContainerHeight,
  noResultContainerHeight,
  noResultHeight,
  primaryBlue,
  resultContainerHeight,
  resultHeight,
  searchContainerHeight,
  separatorHeight,
  smallFontSize,
  staticCenterPoint,
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
      animating: false,
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
      <Animated.View 
        style={{
          alignSelf: 'stretch',
          backgroundColor: primaryBlue,
          height: this.containerHeight,
          zIndex: 10,
        }} 
      >

        <View style={styles.headerContainer}>
          <TouchableHighlight
            onPress={() => this._openSearch()}
            style={styles.searchIcon} 
            underlayColor={primaryBlue}
          >
            <Image source={require('../../../../shared/images/search-icon.png')}/>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => {
              Keyboard.dismiss();
              this.props.navigation.navigate('DrawerOpen');
            }}
            underlayColor={primaryBlue}
            style={styles.headerNavigation}
          >
            <Image source={require('../../../../shared/images/menu-icon.jpg')}/>
          </TouchableHighlight>
        </View>

          <Animated.View
            style={{
              position: 'absolute',
              marginLeft: this.cursorMarginLeft,
              top: 24,
              width: '30%',
            }}
          >
            <TextInput
              autoCapitalize={'characters'}
              autoCorrect={false}
              autoFocus={ this.props.timerList ? false : true }
              fontSize={24}
              keyboardType={'numeric'}
              maxLength={7}
              onChangeText={(license) => this.handleTextInput(license)}
              ref={(ref) => { this.myTextInput = ref }}
              underlineColorAndroid={'transparent'}
              value={this.state.license} 
            />
          </Animated.View>

        <Animated.View
          style={{
            alignSelf: 'center',
            borderWidth: .35,
            borderColor: 'white',
            opacity: this.underlineOpacity,
            position: 'absolute',
            top: navBarContainerHeight,
            width: this.underline,
          }}
        />

        <Animated.View 
          style={{
            borderColor: 'white',
            borderWidth: .35,
            height: this.separatorHeight, 
            position: 'absolute',
            marginLeft: staticCenterPoint,
            top: navBarContainerHeight,
          }} 
        />

        <Animated.View 
          style={{
            flex: 1,
            flexDirection: 'row', 
            opacity: this.buttonOpacity,
          }} 
        >
          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this._handleHistorySearch(this.state.license) }} >
            <Animated.Text 
              style={{
                color: 'white',
                fontSize: smallFontSize,
                opacity: this.textFade, 
              }}
            >
              {'History'}
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={.6}
            onPress={ () => { this.handleVINSearch(this.state.license) }} >
            <Animated.Text 
              style={{
                color: 'white',
                fontSize: smallFontSize,
                opacity: this.textFade, 
              }}
            >
              {'VIN'}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={{
            alignSelf: 'stretch',
            height: this.resultHeight,
            opacity: this.containerOpacity,
          }}
        >
          { 
            this.state.result ?

              <Result
                closeSearch={this.props.closeSearch} 
                data={this.state.result}
                deepSearch={this.deepSearch.bind(this)}
                license={this.state.license}
                minimizeResultContainer={this.minimizeResultContainer.bind(this)}
                navigation={this.props.navigation}
                resizeMenuContainer={this.props.resizeMenuContainer ? this.props.resizeMenuContainer : null}
              /> 

              :

              <View
                style={{
                  alignItems: 'center',
                  alignSelf: 'stretch',
                  height: resultHeight,
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator
                  animating={this.state.animating}
                  size='small' 
                />
              </View> 
          }
        </Animated.View>


        <Animated.View 
          style={{
            alignSelf: 'stretch',
            height: this.verifyHeight,
            opacity: this.containerOpacity,
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
    this._getAsyncData();
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
        this.marginValue = windowCenterPoint;
        this.cursorMarginLeft = new Animated.Value(windowCenterPoint);
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

  async _getAsyncData() {
    this.dates = await AsyncStorage.getItem('@Enforce:dateCount');
    this.dates = JSON.parse(this.dates);  
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
  _handleHistorySearch(license: string) {
    
    if (license.length === 0) {
      this.myTextInput.focus();
      return;
    }

    if (license.length === 4) {
      var vinCheck = parseInt(license) + '';
      vinCheck = vinCheck.length === 4 ? true : false;
    }
      
    if (vinCheck) {
      historySearch(license, "vinSearch", this.historyResultCallback.bind(this));
    } else {
      historySearch(license, "license", this.historyResultCallback.bind(this));
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

  historyResultCallback(result) {
    result = result === undefined ? 'unfound' : result;

    if (result !== 'unfound') {
      this.setState({result});
      this._extendResultContainer(); // Case for extending the container of Search in any component.
      this.props.resizeMenuContainer && this.props.resizeMenuContainer(true); // Case for extending the Menu container of Overview.
      Keyboard.dismiss();
    } else if (result === 'unfound') {
      if (this.props.historyScreen) {
        this.deepSearch();
        return;
      }
      this.setState({result});
      this._showNoResultNotification();
      this.hideNotification = setTimeout(() => {
        this._hideNoResultNotification();
      }, 3300);
    }
  }

  deepSearch() { // Look for license in Firebase.
    if (this.state.animating) return;
    clearTimeout(this.hideNotification);
    this.setState({result: '', animating: true});
    this._showNoResultNotification();
    if (this.props.refPath) {
      getLicenseHistory(this.props.refPath, this.dates, this.state.license, (res) => {
        this._databaseResult(res);
      });
    } else {
      setTimeout(() => {
        this.setState({animating: false});
        this._hideNoResultNotification();
      }, 1500);
    }
  }

  _databaseResult(results) {
    if (results.length) {
      if (this.props.historyScreen) {
        if (results.length > 1) {
          setTimeout(() => {
            this.setState({animating: false});
            this._hideNoResultNotification();
            this.props.displayFirebaseResult(results);
            Keyboard.dismiss();
          }, 2000);
          return;
        }
      }
      var result = {};
      result['type'] = 'ticketed';
      result['data'] = results[0];
      setTimeout(() => {
        this._hideNoResultNotification();
      }, 1500);
      setTimeout(() => {
        this.setState({result, animating: false})
        // Case for extending the container of Search in any component.
        this._extendResultContainer();
        // Case for extending the Menu container of Overview.
        this.props.resizeMenuContainer && this.props.resizeMenuContainer(true);
        Keyboard.dismiss();
      }, 3000);
    } else {
      setTimeout(() => {
        this._hideNoResultNotification();
      }, 1900);
      setTimeout(() => {
        this.setState({result: 'searched', animating: false}); // Display "not found" message w/o the Deep Search option.
        this._showNoResultNotification();
        setTimeout(() => {
          this._hideNoResultNotification();
        }, 3000);
      }, 2600);
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

  _showNoResultNotification() {
    this.props.showNoResultNotificationForMenu && this.props.showNoResultNotificationForMenu();
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
  }

  _hideNoResultNotification() {
    this.props.hideNoResultNotificationForMenu && this.props.hideNoResultNotificationForMenu();
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
    this.setState({license: '', result: null});
    Keyboard.dismiss();
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
        this.buttonOpacity, {
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.containerHeight, {
          toValue: searchContainerHeight,
          duration: 700,
        },
      ),
      Animated.timing(
        this.underlineOpacity, {
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.underline, {
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.containerOpacity, {
          toValue: 0,
          duration: 700,
        },
      ),
      Animated.timing(
        this.separatorHeight, {
          toValue: 0,
          duration: 700,
        },
      ),
    ]).start();
  }
  
}

Search.propTypes = {
  addLicenseToQueue: PropTypes.func,
  closeSearch: PropTypes.func,
  displayFirebaseResult: PropTypes.func,
  hideNoResultNotificationForMenu: PropTypes.func,
  historyScreen: PropTypes.bool,
  licenseParam: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  minimizeMenuContainer: PropTypes.func,
  minimizeResultContainer: PropTypes.func,
  navigation: PropTypes.object.isRequired,
  refPath: PropTypes.string.isRequired,
  refreshTimerList: PropTypes.func,
  resizeMenuContainer: PropTypes.func,
  shouldResetLicense: PropTypes.func,
  showNoResultNotificationForMenu: PropTypes.func,
  timerList: PropTypes.bool,
  toggleVerifyContainer: PropTypes.func,
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: navBarContainerHeight,
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
