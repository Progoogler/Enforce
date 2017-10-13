import React, { Component } from 'react';
import {
	Animated,
	Image,
	PixelRatio,
	Text,
	StyleSheet,
	TouchableNativeFeedback,
	View,
} from 'react-native';
import PropTypes from 'prop-types';

import {
	primaryBlue,
	screenWidth,
 } from '../../styles/common';

export default class Feedback extends Component {
	constructor() {
		super();
		this.mounted = false;
		this.right = new Animated.Value(-screenWidth);
		this.space = PixelRatio.get() * 2 * 32;
		this.state = {
			message: 'Send us questions or comments',
		}
	}

	render() {
		return (
			<Animated.View
				style={{
					alignItems: 'center',
					backgroundColor: primaryBlue,
					borderTopLeftRadius: 20,
					borderBottomLeftRadius: 20,
					bottom: '5%',
					elevation: 2,
					justifyContent: 'center',
					padding: '3%',
					position: 'absolute',
					right: this.right,
				}}
			>
				<TouchableNativeFeedback
					background={TouchableNativeFeedback.Ripple(primaryBlue, true)}
					onPress={() => this.props.openMessenger()}
				>
					<View style={styles.row}>
						<Image 
							source={require('../../../../shared/images/envelope.png')}
							style={styles.image}
						/>
						<Text style={styles.message}> { this.state.message } </Text>
					</View>
				</TouchableNativeFeedback>
			</Animated.View>
		);
	}

	componentDidMount() {
		Animated.timing(
			this.right, {
				toValue: 0,
				duration: 2000,
			}
		).start();
		setTimeout(() => {
			Animated.timing(
				this.right, {
					toValue: -this.space,
					duration: 1500,
				}
			).start();
		}, 7500);
		this.mounted = true;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.thanks) {
			this.mounted && this.setState({message: 'Thank you for your feedback!'});
			Animated.timing(
				this.right, {
					toValue: 0,
					duration: 500,
				}
			).start();
			setTimeout(() => {
				Animated.timing(
					this.right, {
						toValue: -(PixelRatio.get() * 2 * 30),
						duration: 1500,
					}
				).start();
				setTimeout(() => {
					this.props.welcome();
				}, 1500);
			}, 5000);
		}
	}
}

Feedback.propTypes = {
	openMessenger: PropTypes.func.isRequired,
	thanks: PropTypes.bool.isRequired,
	welcome: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
	image: {
		marginRight: '5%',
	},	
	message: {
		color: 'white',
		textAlign: 'center',
	},
	row: {
		flexDirection: 'row',
	},
});