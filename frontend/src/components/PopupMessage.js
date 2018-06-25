import React, { Fragment } from 'react';

const PopupMessage = (props) => (
	<Fragment>
		{
			props.popupMessage ? 
			(<div className={"popup-message "+props.popupMessage.type+(props.popupMessage.show ? " show" : "")}>{props.popupMessage.message}</div>)
			:
			""
		}
	</Fragment>
);

export default PopupMessage;
