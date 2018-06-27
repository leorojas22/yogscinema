import React, { Fragment }from 'react';

class TwitchChat extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			visible: localStorage.getItem("showTwitchChat") ? true : false
		}

		this.toggleTwitchChat = this.toggleTwitchChat.bind(this);
	}

	toggleTwitchChat() {
		let newStatus = !this.state.visible;
		this.setState({
			visible: newStatus
		});

		localStorage.setItem("showTwitchChat", newStatus);
	}

	render() {
		return (
			<div className="twitch-chat">
				<hr />
			{
				this.state.visible ? (
					<Fragment>
						<iframe frameborder="0"
								scrolling="no"
								id="yogscast"
								src="https://www.twitch.tv/embed/yogscast/chat?darkpopout">
						</iframe>
						<button type="button" className="btn-sm btn-purple" onClick={this.toggleTwitchChat}>Hide Chat</button>
					</Fragment>
				) 
				: 
				(<button type="button" className="show-chat-btn btn-sm btn-purple" onClick={this.toggleTwitchChat}>Show Chat</button>)
			}
			</div>
		)
	}
}

export default TwitchChat;
