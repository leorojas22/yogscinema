import React, { Fragment } from 'react';
import { ajaxHelper } from '../helpers/ajax';

class LiveIndicator extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentVideoTitle   : false,
            timeRemaining       : 0,
            videoLength         : 0,
            cinemaPending       : false,
            hideCinemaButton    : false
        }

        this.timeRemainingInterval  = null;
        this.checkLiveInterval      = null;

        this.sayCinema = this.sayCinema.bind(this);
    }

    componentDidMount() {
        this.checkIfLive();
    }

    startTimeRemainingCounter() {

        if(this.timeRemainingInterval) {
            window.clearInterval(this.timeRemainingInterval);
        }

        this.timeRemainingInterval = window.setInterval(() => {
            if(this.state.timeRemaining > 0) {
                this.setState({
                    timeRemaining: this.state.timeRemaining-1
                });
            }
        }, 1000);
    }


    checkIfLive() {
        
        if(this.checkLiveInterval) {
            clearTimeout(this.checkLiveInterval);
        }

        ajaxHelper("/is-live", {
            method: "GET"
        }).then(response => {

            if(typeof response.result !== 'undefined') {
                this.props.updateLiveStatus(response.result);

                if(response.nowPlaying && response.nowPlaying.timeRemaining > 0) {
                    this.setState({
                        currentVideoTitle   : response.nowPlaying.title,
                        timeRemaining       : response.nowPlaying.timeRemaining,
                        videoLength         : response.nowPlaying.videoLength
                    });
                    console.log("TESTING");
                    this.startTimeRemainingCounter();
                }
                else {
                    console.log(response.nowPlaying);
                }

                return true;
            }

            return Promise.reject();
        })
        .catch(err => {
            console.log(err);
            this.props.updateLiveStatus(false);
        });

        this.checkLiveInterval = setTimeout(() => {
            this.checkIfLive();
        }, 120000)
    }

    getVideoTime() {
        // Convert time remaining and video length to hh:mm:ss
        return this.formatTime(this.state.videoLength - this.state.timeRemaining) + " / " + this.formatTime(this.state.videoLength);
    }

    formatTime(seconds) {
        const oneMinute = 60;
        const oneHour = oneMinute*60;
        
        let formatHours   = "00";
        let formatMinutes = "00";

        if(seconds > oneHour) {
            formatHours = Math.floor(seconds/oneHour);
            seconds -= formatHours*oneHour;

            if(formatHours < 10) {
                formatHours = "01"+formatHours;
            }

        }

        if(seconds > oneMinute) {
            formatMinutes = Math.floor(seconds/oneMinute);
            seconds -= formatMinutes*oneMinute;

            if(formatMinutes < 10) {
                formatMinutes = "0"+formatMinutes;
            }
        }

        if(seconds < 10) {
            seconds = "0"+seconds;
        }

        return formatHours+":"+formatMinutes+":"+seconds;
    }

    sayCinema() {
        this.setState({
            cinemaPending: true
        });

        ajaxHelper("/user/cinema", {
            method: "POST",
            body: {
                csrfToken: localStorage.getItem("csrfToken")
            }
        }).then(response => {
            this.props.togglePopupMessage("success", "Success!");
            window.setTimeout(() => {
                this.checkIfLive();
            }, 2000);

            this.setState({
                hideCinemaButton: true
            });

            window.setTimeout(() => {
                this.setState({
                    cinemaPending: false,
                    hideCinemaButton: false
                });
            }, 120000)
        })
        .catch(err => {
            let errorMessage = typeof err.message !== 'undefined' ? err.message : "Unable to say the !cinema command at this time.";
            this.props.togglePopupMessage("error", errorMessage);
            this.setState({
                cinemaPending: false
            });
        });
    }

    render() {
        return (
            <Fragment>
                <div className="live-indicator">
                    <div className={"light "+(this.props.isLive ? "on" : "off")}></div><span>YogsCinema is {this.props.isLive ? "On!" : "Not On" }</span>
                </div>
                <div className="now-playing-text">
                {

                    this.props.isLive ?
                    (
                        this.state.timeRemaining > 0 ? 
                        (
                            <Fragment>
                                <strong>Now Playing: </strong>{this.state.currentVideoTitle}<br />
                                {this.getVideoTime()}
                            </Fragment>
                        )
                        :
                        (
                            !this.state.hideCinemaButton && this.props.connected ? 
                            (
                                <button className="btn-purple btn-auto btn btn-sm cinema-button" type="button" onClick={this.sayCinema} disabled={this.state.cinemaPending}>
                                    {
                                        this.state.cinemaPending ?
                                        (<Fragment><i className="fa fa-spinner fa-spin"></i> Loading...</Fragment>)
                                        :
                                        "Say !cinema"
                                    } 
                                </button>
                            )
                            :
                            ""
                        )
                    )
                    :
                    ""
                }
                </div>
                
            </Fragment>
        );
    }
}

export default LiveIndicator;
