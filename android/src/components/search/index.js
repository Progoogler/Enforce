import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';


export default class VINSearch extends Component {
  constructor() {
    super();
    this.state = {
      buttonOpacity: new Animated.Value(1),
      containerHeight: new Animated.Value(130),
      underlineMargin: new Animated.Value(125),
      underlineOpacity: new Animated.Value(1),
      separatorHeight: new Animated.Value(0),
      underline: new Animated.Value(0),
      textFade: new Animated.Value(0),
      license: '',
    }
    this.marginValue = 125;
  }

  static navigationOptions = {
    drawerLabel: 'VIN Search',
    drawerIcon: () => (
      <Image
        source={require('../../../../shared/images/search-icon.png')}
        style={[styles.icon]}
      />
    )
  };

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
            Keyboard.dismiss();
            this._fadeContainer();
            setTimeout(() => this.props.closeSearch(), 500);
          }}
          underlayColor={'#4286f4'}
          style={styles.searchIcon} >
          <Image source={require('../../../../shared/images/search-icon.png')} />
        </TouchableHighlight>

          <Animated.View style={{
                            width: 150,
                            marginTop: 25,
                            marginLeft: this.state.underlineMargin,
                            height: 50,
                            paddingLeft: 15,
                            zIndex: 10,
                          }}>
            <TextInput
              onChangeText={(license) => { this._handleTextInput(license) }}
              maxLength={7}
              fontSize={24}
              autoCapitalize={'characters'}
              keyboardType={'numeric'}
              autoCorrect={false}
              autoFocus={true}
              underlineColorAndroid={'transparent'}
              onFocus={() => {}} />
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
                        borderWidth: 1,
                        borderColor: 'white',
                        width: this.state.underline,
                        opacity: this.state.underlineOpacity, }}>
        </Animated.View>


        <Animated.View style={{
            opacity: this.state.buttonOpacity,
            flex: 1,
            flexDirection: 'row', }} >

          <TouchableHighlight
            style={styles.button}
            underlayColor='#4286f4'
            onPress={ () => {

            }} >
            <Animated.Text style={{
                            color: 'white',
                            opacity: this.state.textFade, }}>History</Animated.Text>
          </TouchableHighlight>

          <Animated.View style={{
                          borderColor: 'white',
                          borderWidth: .5,
                          height: this.state.separatorHeight,
                        }} />

          <TouchableHighlight
            style={styles.button}
            underlayColor='#4286f4'
            onPress={ () => {

            }} >
            <Animated.Text style={{
                            color: 'white',
                            opacity: this.state.textFade, }}>VIN</Animated.Text>
          </TouchableHighlight>
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
    ]).start();
    setTimeout(() => this.setState({ underline: new Animated.Value(180) }), 550);
  }

  _handleTextInput(license) {
    if (license.length < this.state.license.length) {
      this.marginValue += 7;
      Animated.timing(
        this.state.underlineMargin,
        { toValue: this.marginValue , },
      ).start();
    } else {
      this.marginValue -= 7;
      Animated.timing(
        this.state.underlineMargin,
        { toValue: this.marginValue , },
      ).start();
    }
    this.setState({license});
  }

  _fadeContainer() {

    Animated.parallel([
      Animated.timing(
        this.state.buttonOpacity,
        { toValue: 0,
          duration: 500, },
      ),
      Animated.timing(
        this.state.containerHeight,
        { toValue: 65,
          duration: 500, },
      ),
      Animated.timing(
        this.state.underlineOpacity,
        { toValue: 0,
          duration: 500, },
      ),
      Animated.timing(
        this.state.underline,
        { toValue: 0,
          duration: 500, },
      ),
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
  // container: {
  //   backgroundColor: 'white',
  //   flex: 1,
  //   flexDirection: 'column',
  //   justifyContent: 'flex-start',
  //   alignItems: 'center',
  // },
  // image: {
  //   marginTop: 200,
  // },
  // title: {
  //   fontSize: 24,
  //   marginTop: 180,
  // },
  // message: {
  //   fontSize: 24,
  // },
});
