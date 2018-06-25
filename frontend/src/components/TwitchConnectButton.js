import React from 'react';

const TwitchConnectButton = (props) => (
	<div className="text-center">
		<p>Connect with Twitch to Vote!</p>
		<a className="twitch-connect-btn" href="https://api.yogscinemavote.com/twitch-authenticate">
			<img alt="Twitch Icon" src="/images/twitch-icon.png" /> <span>Connect with Twitch</span>
		</a>
	</div>
);

export default TwitchConnectButton;
