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

import config from './config.js';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            connected		: false,
            popupMessage	: false,
            isLive			: false
        }

        this.togglePopupMessage = this.togglePopupMessage.bind(this);
        this.updateLiveStatus 	= this.updateLiveStatus.bind(this);
    }

    componentDidMount() {

        // Check if user is connected
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
                    this.togglePopupMessage(popupMessage.type, popupMessage.message);
                    window.history.pushState({}, "YogsCinema Vote", config.siteURL);
                }

            }, 100);
            
        }
        
    }

    updateLiveStatus(status) {
        this.setState({
            isLive: status
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

                <LiveIndicator updateLiveStatus={this.updateLiveStatus} isLive={this.state.isLive} />

                <TwitchEmbed />
                {
                    this.state.connected ? (
                        <Fragment>
                            <ConnectedUser user={this.state.connected} />
                            <VoteOptions isLive={this.state.isLive} togglePopupMessage={this.togglePopupMessage} />
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
