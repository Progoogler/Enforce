import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';


export default class StaticNavigation extends Component {
  constructor() {
    super();
  }

  render() { console.log('image', this.props.imageSource)
    return (
      <View style={styles.container} >
        <TouchableWithoutFeedback style={styles.back} onPress={() => this._handleArrow()} >
          <Image
            style={styles.icon}
            source={require('../../../../shared/images/backarrow.jpg')} />
        </TouchableWithoutFeedback>
        <Text style={styles.title}>{ this.props.title ? this.props.title : 'Enforce' }</Text>
        <TouchableHighlight
          underlayColor='#4286f4'
          onPress={ () => {
            this.props.navigation.navigate('DrawerOpen');
          }}
          style={styles.headerNavigation} >
          <Image source={require('../../../../shared/images/menu-icon.jpg')} />
        </TouchableHighlight>
      </View>
    );
  }

  _handleArrow() {
    this.props.navigation.navigate('Overview');
  }

}

//   componentWillMount() { console.log('static mounts')
//     if (this.props.title === 'Map View') {
//       styles.icon = {
//         height: 30,
//         width: 30,
//         marginLeft: 15,
//         marginTop: 16,
//       };
//     } else if (this.props.title === 'Metrics') { console.log('metrics')
//       styles.icon = {
//         height: 30,
//         width: 40,
//         marginLeft: 15,
//         // marginTop: 12,
//       }
//     } else {
//       styles.icon = {
//         // height: 40,
//         // width: 40,
//         // marginLeft: 15,
//         // marginTop: 5,
//       }
//     }
//   }
// }

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4286f4',
    zIndex: 10,
  },
  back: {
    height: 50,
    width: 40,
    marginLeft: 25,
  },
  icon: {
    height: 30,
    width: 40,
    marginLeft: 15,
  },
  title: {
    flex: .70,
    height: 60,
    fontSize: 32,
    marginLeft: 35,
    color: 'white',
    textAlignVertical: 'center',
  },
  headerNavigation: {
    flex: .15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
