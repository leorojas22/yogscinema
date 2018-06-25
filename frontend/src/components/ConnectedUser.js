import React from 'react';

const ConnectedUser = (props) => (
	<div className="connected-user">
		Connected as <strong>{props.user.username}</strong>
		<br />
		<a href="https://api.yogscinemavote.com/user/revoke" className="btn logout">Log Out</a>
		<hr />
	</div>
);

export default ConnectedUser;
