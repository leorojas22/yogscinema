import React from 'react';

class TwitchEmbed extends React.Component {
	componentDidMount() {
		// Show the twitch channel if not on mobile
		if(typeof window !== 'undefined' && typeof window.Twitch !== 'undefined') {
			let style = window.getComputedStyle(document.getElementById("twitch-embed"));
			if(style.display !== "none") {
				new window.Twitch.Embed("twitch-embed", {
					width: '100%',
					height: '100%',
					channel: 'yogscast',
					theme: 'dark'
				});
			}
		}
	}

	render() {
		return (
			<div id="twitch-embed" className="twitch-embed">
				
			</div>
		);
	}
}

export default TwitchEmbed;