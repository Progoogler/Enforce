import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {
  View,
  StyleSheet,
  Button,
  Image,
  AsyncStorage,
  BackAndroid
} from 'react-native';
import Realm from 'realm';
import { connect } from 'react-redux';

class TimerSchema {};
TimerSchema.schema = {
  name: 'Timer',
  properties: {
    latitude: 'int',
    longitude: 'int',
    createdAt: 'int',
    createdAtDate: 'date',
    mediaUri: 'string',
    mediaPath: 'string',
  }
}

class TimerListSchema {};
TimerListSchema.schema = {
  name: 'Timers',
  properties: {
    list1: {type: 'list', objectType: 'Timer'},
    list2: {type: 'list', objectType: 'Timer'},
    list3: {type: 'list', objectType: 'Timer'},
    list4: {type: 'list', objectType: 'Timer'},
    list5: {type: 'list', objectType: 'Timer'},
    list6: {type: 'list', objectType: 'Timer'},
    list7: {type: 'list', objectType: 'Timer'},
    list8: {type: 'list', objectType: 'Timer'},
  }
}

class CameraTimeSchema {};
CameraTimeSchema.schema = {
  name: 'CameraTime',
  properties: {
    timeAccessedAt: 'int'
  }
}

class TimerCountSchema {};
TimerCountSchema.schema = {
  name: 'TimerCount',
  properties: {
    count: 'int'
  }
}


async function setStoredData(data) {
  try {
    await AsyncStorage.setItem('@Quicket:test', data);
    let get = await AsyncStorage.getItem('@Quicket:test');
    console.log('set data', data, 'get data', get);
  } catch (error) {
    console.warn('AsyncStorage error: ', error);
  }
}

class MapApp extends Component {
  constructor() {
    super();
    Realm.clearTestState(); // Uncomment to drop/recreate database
    this.realm = new Realm({
      schema: [{name: 'Dog', properties: {name: 'string'}}, TimerSchema, CameraTimeSchema, TimerListSchema, TimerCountSchema]
    });
  }
  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../parked_logo_72x72.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    )
  };

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.exitApp;
    });
  }

  componentWillUnmount() {
    const stringifiedStore = JSON.stringify(this.props.num);
    console.log('string store', stringifiedStore);
    setStoredData(stringifiedStore);
  }

  render() {
    const { num } = this.props;
    console.log('num', num);

     this.realm.write(() => {
       this.realm.create('Dog', {name: 'Rex'});
     });

    return (
      <View style={styles.container}>
        <View
          style={{position: 'absolute', zIndex: 1, top: 0, left: 0, right: 0}}
          >
          <Button
            onPress={() => this.props.navigation.navigate('Camera')}
            title="Go to notifications"
          />
          <Button
            onPress={() => {
              console.log('realm obj length', this.realm.objects('Dog').length, this.realm.objects('Dog'));
              console.log('Timer obj', this.realm.objects('Timer').length, this.realm.objects('Timer'));
              this.props.dispatch({type: 'INC', payload: 1});
            }}
            title="Increment"
          />
        </View>
        <MapView.Animated
          ref={ref => { this.animatedMap = ref; }}
          style={styles.map}
          mapType="hybrid"
          showsUserLocation={true}
          initialRegion={{
            latitude: 37.78926,
            longitude: -122.43159,
            latitudeDelta: 0.0048,
            longitudeDelta: 0.0020,
          }}>
        </MapView.Animated>
      </View>
    );
  }
}

export default connect(state => {
  return state;
}, null)(MapApp);

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});
