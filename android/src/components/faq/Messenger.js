import React, { Component } from 'react';
import {
	AsyncStorage,
	Modal,
	NetInfo,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';
import PropTypes from 'prop-types';

import { sendFeedback } from '../../../../includes/firebase/database';
import StaticNavigation from '../navigation/StaticNavigation'
import Send from '../timerList/Done';
import {
	messageContainerHeight,
	primaryBlue,
} from '../../styles/common';

export default class Messenger extends Component {
	constructor() {
		super();
		this.email = '';
		this.feedback = {};
		this.message = '';
		this.sendFeedbackToFirebase = this.sendFeedbackToFirebase.bind(this);
		this.state = {
			submitText: 'Send',
		}
	}

	render() { console.log('messenger renders')
		return (
			<Modal
				animationType={'fade'}
				onRequestClose={() => this.props.closeMessenger()}
				visible={this.props.visibility}
			>
				<StaticNavigation 
					closeModal={this.props.closeMessenger}
					title={'Feedback'}
				/>
				<ScrollView	style={styles.scrollView}>
					<View style={styles.inputContainer}>
						<AutoGrowingTextInput
							style={styles.textInput}
							onChangeText={(text) => this._handleTextInput(text)}
							underlineColorAndroid={'white'}
							autoCorrect={false}
							autoCapitalize={'sentences'}
							fontSize={26}
							maxLength={365}
							minHeight={120}
							autoFocus={true}
							placeholder={"What's on your mind?"}
						/>
					</View>
				</ScrollView>
				<Send
					text={this.state.submitText}
					closeModal={this.sendFeedbackToFirebase}
				/>
			</Modal>
		);
	}

	componentDidMount() {
		this._getUserInfo();
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.visibility !== nextProps.visibility) return true;
		if (this.state.submitText !== nextState.submitText) return true;
		return false;
	}

	async _getUserInfo() {
		var profile = await AsyncStorage.getItem('@Enforce:profileSettings');
		profile = JSON.parse(profile);
		this.email = this._parseEmail(profile.email);
		this.feedback.county = profile.county;
		this.feedback.date = new Date() + '';
	}

	sendFeedbackToFirebase() {
		if (this.message.length === 0) {
			this.props.closeMessenger();
		} else {
			NetInfo.isConnected.fetch().then(isConnected => {
				if (isConnected) {
					var question = this.message.includes('?');
					this.feedback.message = this.message.replace(/\W/g, " ");
					if (this.email) {
						if (question) {
							sendFeedback('QUESTION! ' + this.email, this.feedback);
							this.props.closeMessenger('reply');
							return;
						}
						var random = Math.floor(Math.random() * 100);
						sendFeedback(this.email + ' ' + random, this.feedback);
					} else {
						if (question) {
							sendFeedback('QUESTION! ' + this.feedback.date, this.feedback);
							this.props.closeMessenger('reply');
							return;
						}
						sendFeedback(this.feedback.date, this.feedback);
					}
					this.props.closeMessenger('thanks');
				} else {
					this.setState({submitText: 'Must be connected to the Internet'})
					setTimeout(() => this.setState({submitText: 'Send'}), 3000);
				}
			});
		}
	}
	
	_parseEmail(email) {
		var result = email.replace('@', ' AT ');
		result = result.replace('.', ' DOT ');
		return result;
	}

	_handleTextInput(e) {
		this.message = e;
	}

}

Messenger.propTypes = {
	closeMessenger: PropTypes.func.isRequired,
	visibility: PropTypes.bool.isRequired,
}

const styles = StyleSheet.create({
	inputContainer: {		
		height: messageContainerHeight,
		marginLeft: '5%',
		marginRight: '10%',
	},
	scrollView: {
		alignSelf: 'stretch',
		backgroundColor: primaryBlue,
		paddingTop: '5%',
	},	
	textInput: {
		color: 'white',
	}
});