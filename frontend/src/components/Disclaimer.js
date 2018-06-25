import React from 'react';

const Disclaimer = (props) => (
	<div className="disclaimer">
		<p>
			<strong>Disclaimer:</strong> This is a fan made site.  It is in no way associated with the Yogscast or Twitch.<br />
			If you find any bugs or want to leave feedback, message me on reddit: <a href="https://www.reddit.com/u/lolparodyaccounts" target="_blank" rel="noopener noreferrer">/u/lolparodyaccounts</a> 
		</p>
		<p>
		<strong>Note:</strong> If you connect to this app and would like to fully disconnect, <a href="https://www.twitch.tv/settings/connections" target="_blank" rel="noopener noreferrer">Click Here</a>.  Scroll down to "YogsCinema Vote" and then click Disconnect.
		</p>
		<p>
			<strong>Credits:</strong> <a href="https://yogsdb.com" rel="noopener noreferrer" target="_blank">YogsDB.com</a> for the info in the custom votes section
		</p>
	</div>
);

export default Disclaimer;
