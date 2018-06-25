import React from 'react';

const ConnectedUser = (props) => (
	<div className="connected-user">
		Connected as <strong>{props.user.username}</strong>
		<br />
		<a href="https://api.yogscinemavote.com/user/revoke">Log Out</a>
	</div>
);

export default ConnectedUser;
