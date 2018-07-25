import React, { Component, Fragment } from 'react';
import './App.css';

import { ajaxHelper } from './helpers/ajax';
import VoteOptions from './components/VoteOptions';
import TwitchEmbed from './components/TwitchEmbed';
import LiveIndicator from './components/LiveIndicator';
import Disclaimer from './components/Disclaimer';
import PopupMessage from './components/PopupMessage';
import TwitchConnectButton from './components/TwitchConnectButton';
import PageTitle from './components/PageTitle';
import ConnectedUser from './components/ConnectedUser';
import TwitchChat from './components/TwitchChat';
import NowPlaying from './components/NowPlaying';

import config from './config.js';

import socket from './helpers/socket';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            connected		: false,
            popupMessage	: false,
            isLive			: false,
            voteImages      : false,
            currentVideoTitle   : false,
            timeRemaining       : 0,
            videoLength         : 0,
            extraTimeRemaining  : 0
        }

        this.togglePopupMessage = this.togglePopupMessage.bind(this);
        this.updateLiveStatus 	= this.updateLiveStatus.bind(this);
        this.setNowPlayingState = this.setNowPlayingState.bind(this);
        this.startTimeRemainingCounter = this.startTimeRemainingCounter.bind(this);


        this.timeRemainingInterval  = null;
    }

    setNowPlayingState(nowPlaying) {
        this.setState({
            currentVideoTitle   : nowPlaying.title,
            timeRemaining       : nowPlaying.timeRemaining,
            videoLength         : nowPlaying.videoLength,
            extraTimeRemaining  : nowPlaying.extraTimeRemaining
        });
    }

    
    // Starts a timer to decrease the timeRemaining and extraTimeRemaining by 1 every second until they reach 0
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
            
            if(this.state.extraTimeRemaining > 0) {
                this.setState({
                    extraTimeRemaining: this.state.extraTimeRemaining-1
                });
            }
            
            if(this.state.extraTimeRemaining === 0 && this.state.timeRemaining === 0) {
                window.clearInterval(this.timeRemainingInterval);
                this.timeRemainingInterval = null;
            }

        }, 1000);
    }

    checkIfUserIsConnected() {
        ajaxHelper("/user", {
            method: "GET"
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                this.setState({
                    connected: response.user
                });
            }
        })
        .catch(err => {
            this.setState({
                connected: false
            })
        });
    }

    parseQueryString() {
        if(window.location.search !== "") {
            let popupMessage = false;
            setTimeout(() => {
                switch(window.location.search) {
                    case '?error=1':
                        popupMessage = {
                            type: 'error', 
                            message: 'Unable to connect with Twitch.'
                        }
                        break;
                    case '?error=2':
                        popupMessage = {
                            type: 'error', 
                            message: 'Unable to revoke access.  Please login to Twitch under the Settings > Connections tab to fully revoke access.'
                        }
                        break;
                    case '?revoked=1':
                        popupMessage = {
                            type: 'success', 
                            message: "Successfully logged out."
                        }
                        break;	
                    default:
                        break;
                }

                if(popupMessage) {
                    // Show the popup message and remove the query string
                    this.togglePopupMessage(popupMessage.type, popupMessage.message);
                    window.history.pushState({}, "YogsCinema Vote", config.siteURL);
                }

            }, 100);
            
        }
    }

    componentDidMount() {
        // Check if user is connected
        this.checkIfUserIsConnected();

        // When coming to the page and there's a query string, check to see if it's something we expect
        this.parseQueryString();
        
        // Check to see if there are vote images to show
        socket.on("showImages", (imageID) => {
            this.setState({
                voteImages: imageID
            });
        });

        // Check to see if there is now playing info
        socket.on("nowPlaying", (nowPlaying) => {
            this.setNowPlayingState(nowPlaying);
            this.startTimeRemainingCounter();
        });
    }

    updateLiveStatus(response) {
        this.setState({
            isLive: response.result,
            voteImages: response.voteImages
        });
    }

    clearPopupMessage() {
        if(this.state.popupMessage) {
            let updatedState = Object.assign({}, this.state.popupMessage);
            setTimeout(() => {
                updatedState.show = false;
                this.setState({ popupMessage: updatedState });

                setTimeout(() => {
                    this.setState({ popupMessage: false });
                }, 250);

            }, 5000);
            
        }
    }

    showPopupMessage() {
        if(this.state.popupMessage) {
            let updatedState = Object.assign({}, this.state.popupMessage);
            setTimeout(() => {
                updatedState.show = true;
                this.setState({ popupMessage: updatedState });
            }, 150)
            
        }
    }

    togglePopupMessage(type, message) {

        this.setState({
            popupMessage: {
                type, 
                message,
                show: false
            }
        });

        this.showPopupMessage();
        this.clearPopupMessage();
    }


    render() {
        return (
            <div className="App">
                <PageTitle />

                <LiveIndicator 
                    setNowPlayingState          = {this.setNowPlayingState} 
                    connected                   = {this.state.connected} 
                    updateLiveStatus            = {this.updateLiveStatus} 
                    isLive                      = {this.state.isLive} 
                    togglePopupMessage          = {this.togglePopupMessage} 
                    currentVideoTitle           = {this.state.currentVideoTitle}
                    timeRemaining               = {this.state.timeRemaining}
                    videoLength                 = {this.state.videoLength}
                    extraTimeRemaining          = {this.state.extraTimeRemaining}
                    startTimeRemainingCounter   = {this.startTimeRemainingCounter}
                />
                <NowPlaying
                    connected                   = {this.state.connected} 
                    isLive                      = {this.state.isLive} 
                    togglePopupMessage          = {this.togglePopupMessage} 
                    currentVideoTitle           = {this.state.currentVideoTitle}
                    timeRemaining               = {this.state.timeRemaining}
                    videoLength                 = {this.state.videoLength}
                    extraTimeRemaining          = {this.state.extraTimeRemaining}
                />

                <TwitchEmbed />
                {
                    this.state.connected ? (
                        <Fragment>
                            <ConnectedUser user={this.state.connected} />
                            <VoteOptions 
                                extraTimeRemaining  = {this.state.extraTimeRemaining} 
                                voteImages          = {this.state.voteImages} 
                                isLive              = {this.state.isLive} 
                                togglePopupMessage  = {this.togglePopupMessage} 
                            />
                        </Fragment>
                    )
                    :
                    (<TwitchConnectButton />)
                }

                <TwitchChat />

                <Disclaimer />
                
                <PopupMessage popupMessage={this.state.popupMessage} />

            </div>
        );
    }
}

export default App;
