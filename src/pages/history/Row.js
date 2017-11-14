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

import MapModal from '../../components/MapModal';
import {
  imageSize,
  primaryBlue,
  smallFontSize,
} from '../../styles/common';

export default class Row extends Component {
  constructor() {
    super();
    this.closeModal = this.closeModal.bind(this);
    this.mounted = false;
    this.state = {
      animating: false,
      getImageText: `Get${'\n'}Photo`,
      image: [],
      modalVisible: false,
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          {
            (this.props.selected === "Today's Tickets" || this.props.selected === "Today's Expired") ?
            <TouchableOpacity 
              activeOpacity={.4} 
              onPress={() => this.props.maximizeOrMinimizeImage(this.props.data.mediaUri)}
              style={styles.imageContainer}
            >
              <Image style={styles.image} source={{uri: this.props.data.mediaUri}}/>
            </TouchableOpacity>
            :
            <TouchableOpacity 
              activeOpacity={.4} 
              onPress={() => this._getImageFromDatabase()}
              style={styles.getImageButton} 
            >
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
              <Text><Text style={styles.label}>License:</Text> {this.props.data.license}</Text> 
              : 
              null
            }

            <Text><Text style={styles.label}>Photo taken:</Text> {this._getPrettyTimeFormat(this.props.data.createdAt)}</Text>

            { 
              this.props.data.ticketedAt !== 0 ? 
              <Text><Text style={styles.label}>Ticketed:</Text> {this._getPrettyTimeFormat(this.props.data.ticketedAt)}</Text> 
              : 
              null 
            }

            <Text><Text style={styles.label}>Time limit:</Text> {this._getTimeLimitDesc(this.props.data.timeLength)}</Text>
          </View>

          { 
            this.props.data.latitude || this.props.data.description ?
            <TouchableOpacity
              style={styles.button}
              activeOpacity={.9}
              onPress={() => this.mounted && this.setState({modalVisible: true}) } >
              <View>
                <Text style={styles.buttonText}>Show Map</Text>
              </View>
            </TouchableOpacity>
            : 
            null 
          }

        </View>

        { 
          this.state.modalVisible ? 
          <MapModal
            closeModal={this.closeModal}
            description={this.props.data.description}
            latitude={this.props.data.latitude}
            longitude={this.props.data.longitude}
            visibility={this.state.modalVisible}
          /> 
          : 
          null 
        }

      </View>
    );
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.dateTransition !== nextProps.dateTransition) {
      this.mounted && this.setState({image: []});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.animating !== nextState.animating) return true;
    if (this.state.getImageText !== nextState.getImageText) return true;
    if (this.state.image.length !== nextState.image.length) return true;
    if (this.state.modalVisible !== nextState.modalVisible) return true;
    if (this.props.selected !== nextProps.selected) return true;
    if (this.props.data !== nextProps.data) return true;
    return false;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _getTimeLimitDesc(timeLimit) {
    var limit;
    if (timeLimit < 1) {
      limit = Math.floor(timeLimit * 60);
      return `${limit} ${limit === 1 ? 'minute' : 'minutes'}`;
    } else {
      limit = timeLimit + '';
      if (limit.length > 4) limit = limit.slice(0, 4);
      return `${limit} ${limit === 1 ? 'hour' : 'hours'}`;
    }
  }

  _getPrettyTimeFormat(createdAt: number): string {
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
          image: [<View 
                    key={date}
                    style={styles.getImageButton} 
                  >
                    <Text style={styles.getImageText}>Photo {'\n'}not{'\n'}available</Text>
                  </View>],
          animating: false,
        });
      } else {
        this.mounted && this.setState({
          image: [<TouchableOpacity
                    activeOpacity={.8}
                    key={date} 
                    onPress={() => this.props.maximizeOrMinimizeImage(url)}
                    style={styles.imageContainer}
                  >
                    <Image style={styles.image} source={{ uri: url }}/>
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
  dateTransition: PropTypes.bool.isRequired,
  getTicketImage: PropTypes.func.isRequired,
  maximizeOrMinimizeImage: PropTypes.func.isRequired,
  profileId: PropTypes.string,
  profileSettings: PropTypes.object,
  selected: PropTypes.string.isRequired,
}

const styles = StyleSheet.create({
  activity: {
    alignSelf: 'center',
    left: '10%',
    position: 'absolute',
    zIndex: 10,
  },
  button: {
    backgroundColor: primaryBlue,
    borderRadius: 5,
    borderWidth: 1,
    bottom: 0,
    elevation: 4,
    height: '35%',
    justifyContent: 'center',
    padding: '1%',
    position: 'absolute',
    right: 0,
    width: '20%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  container: {
    padding: '3%',
  },
  getImageButton: {
    backgroundColor: 'grey',
    borderWidth: 1,
    elevation: 4,
    height: imageSize,
    justifyContent: 'center',
    marginRight: '4%',
    width: imageSize,
  },
  getImageText: {
    color: 'white',
    textAlign: 'center',
  },
  image: {
    alignSelf: 'center', 
    height: imageSize, 
    width: imageSize,
  },
  imageContainer: {
    height: imageSize,
    marginRight: '4%',
    width: imageSize,
  },
  label: {
    fontSize: smallFontSize,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
  },
});
 