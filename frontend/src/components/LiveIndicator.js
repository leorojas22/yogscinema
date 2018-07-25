import React, { Fragment } from 'react';
import { ajaxHelper } from '../helpers/ajax';

class LiveIndicator extends React.Component {

    constructor(props) {
        super(props);
        this.checkLiveInterval = null;
    }

    componentDidMount() {
        this.checkIfLive();
    }


    checkIfLive() {
        
        if(this.checkLiveInterval) {
            clearTimeout(this.checkLiveInterval);
        }

        ajaxHelper("/is-live", {
            method: "GET"
        }).then(response => {

            if(typeof response.result !== 'undefined') {
                this.props.updateLiveStatus(response);
                if(response.nowPlaying && (response.nowPlaying.extraTimeRemaining > 0)) {
                    this.props.setNowPlayingState(response.nowPlaying);
                    this.props.startTimeRemainingCounter();
                }

                return true;
            }

            return Promise.reject();
        })
        .catch(err => {
            console.log(err);
            this.props.updateLiveStatus(false);
        });

        // Check if YogsCinema is live again in 2 minutes
        this.checkLiveInterval = setTimeout(() => {
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
