import React from 'react';

import config from '../config';

const ConnectedUser = (props) => (
	<div className="connected-user">
		Connected as <strong>{props.user.username}</strong>
		<br />
		<a href={config.apiURL+"/user/revoke"} className="btn logout">Log Out</a>
		<hr />
	</div>
);

export default ConnectedUser;
