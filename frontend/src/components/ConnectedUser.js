import React from 'react';

const ConnectedUser = (props) => (
	<div className="connected-user">
		Connected as <strong>{props.user.username}</strong>
	</div>
);

export default ConnectedUser;
