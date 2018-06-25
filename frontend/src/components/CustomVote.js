import React from 'react';

const CustomVote = (props) => {
	return (
		<div className="custom-vote">
			<img src={props.image} />
			<p>{props.title}</p>
			<button type="button" disabled={props.disabled} onClick={props.onClick}>
				!vote {props.voteCommand}
			</button>
		</div>
	);
}

export default CustomVote;
