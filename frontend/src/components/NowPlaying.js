import React, { Fragment } from 'react';
import { ajaxHelper } from '../helpers/ajax';

class NowPlaying extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cinemaPending       : false,
            hideCinemaButton    : false,
        }

        this.sayCinema = this.sayCinema.bind(this);
    }

    getVideoTime() {
        // Convert time remaining and video length to hh:mm:ss
        return this.formatTime(this.props.videoLength - this.props.timeRemaining) + " / " + this.formatTime(this.props.videoLength);
    }

    // Formats time to display like "00:00:00"
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

    // Says "!cinema" in the chat
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
            <div className="now-playing-text">
                {

                    this.props.isLive ?
                    (
                        this.props.extraTimeRemaining > 0 ? 
                        (
                            <Fragment>
                                <strong>Now Playing: </strong>{this.props.currentVideoTitle}<br />
                                {this.getVideoTime()}
                            </Fragment>
                        )
                        :
                        (
                            !this.state.hideCinemaButton && this.props.connected ? 
                            (
                                <button 
                                    className   = "btn-purple btn-auto btn btn-sm cinema-button" 
                                    type        = "button" 
                                    onClick     = {this.sayCinema} 
                                    disabled    = {this.state.cinemaPending}
                                >
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
        );
    }
}

export default NowPlaying;
