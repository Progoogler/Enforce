import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Dimensions,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';

import historySearch from './historySearch';
import Result from './Result';

const center = Math.floor(Dimensions.get('window').width / 2);

export default class Search extends Component {
  constructor() {
    super();
    this.state = {
      buttonOpacity: new Animated.Value(1),
      containerHeight: new Animated.Value(65),
      underlineMargin: new Animated.Value(center),
      underlineOpacity: new Animated.Value(1),
      separatorHeight: new Animated.Value(0),
      underline: new Animated.Value(0),
      textFade: new Animated.Value(0),
      resultHeight: new Animated.Value(0),
      resultOpacity: new Animated.Value(0),
      license: '',
      result: null,
    }
    this.marginValue = center;
  }

  render() {
    return (
      <Animated.View style={{
        zIndex: 10,
        height: this.state.containerHeight,
        alignSelf: 'stretch',
        backgroundColor: '#4286f4', }} >

        <View style={styles.headerContainer}>

        <TouchableHighlight
          onPress={ () => {
            this.state.result !== null && this.minimizeResultContainer();
            this.props.minimizeMenuContainer && this.props.minimizeMenuContainer();

            this.myTextInput.isFocused() && Keyboard.dismiss();
            //this.extendResultContainer();

            this.props.timerList && this.myTextInput.focus();
            !this.props.timerList && Keyboard.dismiss();
            !this.props.timerList && this._fadeContainer();
            !this.props.timerList && setTimeout(() => this._mounted && this.props.closeSearch(), 500);

            this.setState({ license: '', underlineMargin: new Animated.Value(center) });
            this.marginValue = center;
          }}
          underlayColor={'#4286f4'}
          style={styles.searchIcon} >
          <Image source={require('../../../../shared/images/search-icon.png')} />
        </TouchableHighlight>

          <Animated.View style={{
                            position: 'absolute',
                            top: 15,
                            width: 150,
                            marginLeft: this.state.underlineMargin,
                            height: 80,
                            zIndex: 10,
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
              onFocus={() => {}}
              value={this.state.license} />
          </Animated.View>

          <TouchableHighlight
            onPress={ () => {
              Keyboard.dismiss();
              this.props.navigation.navigate('DrawerOpen')
            }}
            underlayColor={'#4286f4'}
            style={styles.headerNavigation} >
            <Image source={require('../../../../shared/images/menu-icon.jpg')} />
          </TouchableHighlight>
        </View>


        <Animated.View style={{
                        alignSelf: 'center',
                        height: 1,
                        borderWidth: .35,
                        borderColor: 'white',
                        width: this.state.underline,
                        opacity: this.state.underlineOpacity, }}>
        </Animated.View>


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
                                  minimizeMenuContainer={this.props.minimizeMenuContainer ? this.props.minimizeMenuContainer : null}
                                  minimizeResultContainer={this.minimizeResultContainer.bind(this)} /> : null }
        </Animated.View>

      </Animated.View>
    );
    {/**/}
  }

  componentDidMount() {
    Animated.parallel([
      Animated.timing(
        this.state.underline,
        { toValue: 180,
          duration: 500 },
      ),
      Animated.timing(
        this.state.textFade,
        { toValue: 1,
          duration: 500, },
      ),
      Animated.timing(
        this.state.separatorHeight,
        { toValue: 40,
          duration: 250, },
      ),
      Animated.timing(
        this.state.containerHeight,
        { toValue: 130,
          duration: 500, },
      ),
    ]).start();
    if (this.props.timerList) this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    this._mounted = true;
    setTimeout(() => this._mounted && this.setState({containerHeight: new Animated.Value(130)}), 500);
  }

  componentWillUnmount() {
    this._mounted = false;
    this.props.timerList && this.keyboardDidHideListener.remove();
  }

  componentWillUpdate() { console.log('search component updates')
    if (this.props.timerList) {
      if (this.props.shouldResetLicense()) {
        this.setState({license: '', underlineMargin: new Animated.Value(center)});
        this.marginValue = center;
        this.props.shouldResetLicense('done');
      }
    }
  }

  _handleHistorySearch() { console.log('HISTORY BUTTON PRESSED')
    if (this.state.license.length === 0) {
      this.myTextInput.focus();
    } else {
      let result = historySearch(this.state.license); console.log('result', result);
      this.setState({result});

      // Case for extending the container of Search in any component.
      if (result !== undefined) this.extendResultContainer(true);

      // Case for extending the Menu container of Overview.
      if (result !== undefined) this.props.extendMenuContainer && this.props.extendMenuContainer();

      // Add license to current Timer in queue in TimerList if in TimerList.
      this.props.timerList && this.props.addLicenseToQueue(this.state.license);
    }
  }

  _handleVINSearch() { console.log('VIN BUTTON PRESSED')
    if (this.state.license.length === 0) {
      this.myTextInput.focus();
    } else {

      this.props.timerList && this.props.addLicenseToQueue(this.state.license);
    }
  }

  extendResultContainer(extend) {
    console.log('hi');
    if (extend) {
      Animated.parallel([
        Animated.timing(
          this.state.containerHeight, {
            toValue: 250,
            duration: 600,
          },
        ),
        Animated.timing(
          this.state.resultHeight, {
            toValue: 115,
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
  }

  minimizeResultContainer() {
    Animated.parallel([
      Animated.timing(
        this.state.containerHeight, {
          toValue: 130,
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
    this.setState({license: '', result: null, underlineMargin: new Animated.Value(center)});
  }

    // TODO Option to close only the result?
    // } else { console.log('close container')
    //   Animated.parallel([
    //     Animated.timing(
    //       this.state.resultOpacity,
    //       { toValue: 0,
    //         duration: 800, },
    //     ),
    //     Animated.timing(
    //       this.state.resultHeight,
    //       { toValue: 130,
    //         duration: 800, },
    //     ),
    //   ]).start();
    // }


// TODO TODO result check to display not found or vin as well
//this._displayResultAnimated('history');
  // _displayResultAnimated(result) {
  //   if (result === 'history') {
  //     Animated.timing(
  //       this.state.containerHeight,
  //       { toValue: 230,
  //         duration: 900, },
  //     ).start();
  //   } else {
  //     Animated.timing(
  //       this.state.containerHeight,
  //       { toValue: 195,
  //         duration: 500, },
  //     ).start();
  //   }
  // }

   _keyboardDidHide() {
     if (this.state.license) this.props.addLicenseToQueue(this.state.license);
   }

  _handleTextInput(license) {
    if (license.length < this.state.license.length) {
      this.marginValue += 7;
      Animated.timing(
        this.state.underlineMargin, {
          toValue: this.marginValue,
        },
      ).start();
    } else {
      this.marginValue -= 7;
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
          duration: 500,
        },
      ),
      Animated.timing(
        this.state.containerHeight,{
          toValue: 65,
          duration: 600,
        },
      ),
      Animated.timing(
        this.state.underlineOpacity,{
          toValue: 0,
          duration: 500,
        },
      ),
      Animated.timing(
        this.state.underline,{
          toValue: 0,
          duration: 500,
        },
      ),
      Animated.timing(
        this.state.resultOpacity,{
          toValue: 0,
          duration: 600,
        },
      ),
      // Animated.timing(
      //   this.state.resultHeight,
      //   { toValue: 130,
      //     duration: 800, },
      // ),
    ]).start();
  }
}


const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    height: 130,
    alignSelf: 'stretch',
    backgroundColor: '#4286f4',
  },
  underlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchIcon: {
    marginTop: 5,
    marginRight: 5,
    height: 60,
    width: 60,
  },
  headerNavigation: {
    position: 'absolute',
    right: 1,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: .70,
    height: 60,
    paddingLeft: 36,
    fontSize: 32,
    color: 'white',
    textAlignVertical: 'center',
  },
  button: {
    flex: .5,
    height: 70,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
