import React from 'react';
import { ajaxHelper } from '../helpers/ajax';

class LiveIndicator extends React.Component {

	componentDidMount() {
		this.checkIfLive();
	}

	checkIfLive() {
		ajaxHelper("/is-live", {
			method: "GET"
		}).then(response => {
			if(typeof response.result !== 'undefined') {
				this.props.updateLiveStatus(response.result);
				return true;
			}

			return Promise.reject();
		})
		.catch(err => {
			this.props.updateLiveStatus(false);
		});

		setTimeout(() => {
			this.checkIfLive();
		}, 120000)
	}

	render() {
		return (
			<div className="live-indicator">
				<div className={"light "+(this.props.isLive ? "on" : "off")}></div><span>YogsCinema is {this.props.isLive ? "On!" : "Not On" }</span>
			</div>
		);
	}
}

export default LiveIndicator;
