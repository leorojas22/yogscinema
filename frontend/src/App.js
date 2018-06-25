import React, { Component, Fragment } from 'react';
import './App.css';

import { ajaxHelper } from './helpers/ajax';
import VoteOptions from './components/VoteOptions';
import TwitchEmbed from './components/TwitchEmbed';
import LiveIndicator from './components/LiveIndicator';
import Disclaimer from './components/Disclaimer';
import PopupMessage from './components/PopupMessage';
import TwitchConnectButton from './components/TwitchConnectButton';
import PageTitle from './components/PageTitle';
import ConnectedUser from './components/ConnectedUser';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			connected		: false,
			popupMessage	: false,
			isLive			: false
		}

		this.togglePopupMessage = this.togglePopupMessage.bind(this);
		this.updateLiveStatus 	= this.updateLiveStatus.bind(this);
	}

	componentDidMount() {

		// Check if user is connected
		ajaxHelper("/user", {
			method: "GET"
		}).then(response => {
			if(typeof response.result !== 'undefined' && response.result) {
				this.setState({
					connected: response.user
				});
			}
		})
		.catch(err => {
			this.setState({
				connected: false
			})
		});
	}

	updateLiveStatus(status) {
		this.setState({
			isLive: status
		});
	}


	clearPopupMessage() {
		if(this.state.popupMessage) {
			let updatedState = Object.assign({}, this.state.popupMessage);
			setTimeout(() => {
				updatedState.show = false;
				this.setState({ popupMessage: updatedState });

				setTimeout(() => {
					this.setState({ popupMessage: false });
				}, 250);

			}, 5000);
			
		}
	}

	showPopupMessage() {
		if(this.state.popupMessage) {
			let updatedState = Object.assign({}, this.state.popupMessage);
			setTimeout(() => {
				updatedState.show = true;
				this.setState({ popupMessage: updatedState });
			}, 150)
			
		}
	}

	togglePopupMessage(type, message) {

		this.setState({
			popupMessage: {
				type, 
				message,
				show: false
			}
		});

		this.showPopupMessage();
		this.clearPopupMessage();
	}


	render() {
		return (
			<div className="App">
				<PageTitle />

				<LiveIndicator updateLiveStatus={this.updateLiveStatus} isLive={this.state.isLive} />

				<TwitchEmbed />
				{
					this.state.connected ? (
						<Fragment>
							<ConnectedUser user={this.state.connected} />
							<VoteOptions isLive={this.state.isLive} togglePopupMessage={this.togglePopupMessage} />
						</Fragment>
					)
					:
					(<TwitchConnectButton />)
				}
				
				<Disclaimer />
				
				<PopupMessage popupMessage={this.state.popupMessage} />

			</div>
		);
	}
}

export default App;
