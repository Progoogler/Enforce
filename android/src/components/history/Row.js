import React, { Component } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import MapModal from './MapModal';
import {
  imageSize,
  primaryBlue,
  smallFontSize,
} from '../../styles/common';

export default class Row extends Component {
  constructor() {
    super();
    this.state = {
      animating: false,
      getImageText: `Get${'\n'}Photo`,
      image: [],
      modalVisible: false,
    }
    this.mounted = false;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          {
            (this.props.selected === "Today's Tickets" || this.props.selected === "Today's Expired") ?
            <TouchableOpacity activeOpacity={.4} onPress={() => this.props.maximizeOrMinimizeImage(this.props.data.mediaUri)}>
              <Image style={styles.image} source={{uri: this.props.data.mediaUri}} />
            </TouchableOpacity>
            :
            <TouchableOpacity activeOpacity={.4} style={styles.getImageButton} onPress={() => this._getImageFromDatabase() }>
              { this.state.image.length === 0 ? <Text style={styles.getImageText}>{this.state.getImageText}</Text> : this.state.image[0] }
            </TouchableOpacity>
          }

          <ActivityIndicator style={styles.activity} animating={this.state.animating} size='small' />
          <View>
            {
              this.props.data.license && this.props.data.VIN ?
              <Text><Text style={styles.label}>License:</Text> {this.props.data.license + '         '}
              <Text style={styles.label}>VIN:</Text> {this.props.data.VIN}</Text> :

              this.props.data.license ?

              <Text><Text style={styles.label}>License:</Text> {this.props.data.license}</Text> : null
            }
            <Text><Text style={styles.label}>Photo taken:</Text> {this._getPrettyTimeFormat(this.props.data.createdAt)}</Text>

            { this.props.data.ticketedAt !== 0 ? <Text><Text style={styles.label}>Ticketed:</Text> {this._getPrettyTimeFormat(this.props.data.ticketedAt)}</Text> : null }

            <Text><Text style={styles.label}>Time limit:</Text> {this._getTimeLimitDesc(this.props.data.timeLength)}</Text>
          </View>

          { this.props.data.latitude || this.props.data.description ?
            <TouchableOpacity
              style={styles.button}
              activeOpacity={.9}
              onPress={() => this.mounted && this.setState({modalVisible: true}) } >
              <View>
                <Text style={styles.buttonText}>Show Map</Text>
              </View>
            </TouchableOpacity>
            : null }

        </View>

        { this.state.modalVisible ? <MapModal
                                      visibility={this.state.modalVisible}
                                      latitude={this.props.data.latitude}
                                      longitude={this.props.data.longitude}
                                      description={this.props.data.description}
                                      closeModal={this.closeModal.bind(this)} /> : null }

      </View>
    );
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUpdate() {
    if (this.props.dateTransition) {
      this.mounted && this.setState({image: []});
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _getTimeLimitDesc = (timeLimit) => {
    if (timeLimit < 1) {
      return `${timeLimit * 60} minutes`;
    } else {
      return `${timeLimit} ${timeLimit === 1 ? 'hour' : 'hours'}`;
    }
  }

  _getPrettyTimeFormat = (createdAt: number): string => {
    let date = new Date(createdAt);
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    let str = date + '';
    str = str.slice(0, 10);
    return `${hour}:${minutes} ${period} ${str}`;
  }

  _getImageFromDatabase() {
    this.mounted && this.setState({animating: true});
    let date = new Date(this.props.data.createdAt);
    let datePath=`${date.getMonth() + 1}-${date.getDate()}`;
    let refPath = `${this.props.profileSettings.state}/${this.props.profileSettings.county}/${this.props.profileId}/${datePath}`;
    let time = this.props.data.createdAt + '';
    this.props.getTicketImage(refPath, time, (url) => {
      if (url === null) {
        this.mounted && this.setState({
          image: [<View style={styles.getImageButton} key={date}><Text style={styles.getImageText}>Photo {'\n'}not{'\n'}available</Text></View>],
          animating: false,
        });
      } else {
        this.mounted && this.setState({
          image: [<TouchableOpacity
                    style={styles.image}
                    activeOpacity={.8}
                    onPress={() => this.props.maximizeOrMinimizeImage(url)}
                    key={date} >
                      <Image style={{alignSelf: 'center', height: imageSize, width: imageSize}} source={{ uri: url }} />
                    </TouchableOpacity>],
          animating: false,
        });
      }
    });
  }

  closeModal() {
    this.mounted && this.setState({modalVisible: false});
  }

}

Row.propTypes = {
  data: PropTypes.object.isRequired,
  maximizeOrMinimizeImage: PropTypes.func.isRequired,
  dateTransition: PropTypes.bool.isRequired,
  profileSettings: PropTypes.object,
  profileId: PropTypes.string,
  getTicketImage: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  container: {
    padding: '3%',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  image: {
    height: imageSize,
    width: imageSize,
    marginRight: '4%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: smallFontSize,
  },
  activity: {
    position: 'absolute',
    alignSelf: 'center',
    left: '10%',
    zIndex: 10,
  },
  button: {
    backgroundColor: primaryBlue,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 5,
    padding: '1%',
    height: '35%',
    width: '20%',
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  getImageButton: {
    backgroundColor: 'grey',
    height: imageSize,
    width: imageSize,
    marginRight: '4%',
    borderWidth: 1,
    justifyContent: 'center',
    elevation: 4,
  },
  getImageText: {
    color: 'white',
    textAlign: 'center',
  }
});
 