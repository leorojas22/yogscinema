import React from 'react';
import config from '../config';

const TwitchConnectButton = (props) => (
	<div className="text-center">
		<p>Connect with Twitch to Vote!</p>
		<a className="twitch-connect-btn" href={config.apiURL+"/twitch-authenticate"}>
			<img alt="Twitch Icon" src="/images/twitch-icon.png" /> <span>Connect with Twitch</span>
		</a>
	</div>
);

export default TwitchConnectButton;
