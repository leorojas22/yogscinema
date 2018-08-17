import React, { Fragment } from 'react';
import CustomVote from './CustomVote';
import { ajaxHelper } from '../helpers/ajax';
import config from '../config';

const API_URL = config.apiURL;

class VoteOptions extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isVoting: false,
            customVotes: [],
            lastVote: false
        }
    }

    parseVote(option) {
        let lastVote = option;
        if(isNaN(option)) {
            // Search through customVotes to get title
            if(this.state.customVotes.length > 0) {
                for(let x=0;x<this.state.customVotes.length; x++) {
                    let customVote = this.state.customVotes[x];
                    if(customVote.vote_command === option) {
                        lastVote = customVote.video_title;
                        break;
                    }
                }
            }
        }

        return lastVote;
    }

    checkForCustomVotes() {

        ajaxHelper("/votes", {
            method: "GET"
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                this.setState({
                    customVotes: response.data
                });
            }
        })
        .catch(err => {
            this.setState({
                customVotes: []
            })
        });

        setTimeout(() => {
            this.checkForCustomVotes();
        }, 15000);
    }

    componentDidMount() {
        this.checkForCustomVotes();
    }

    vote(option) {

        this.setState({
            isVoting: true
        });

        ajaxHelper("/user/vote", {
            method: "POST",
            body: {
                voteOption: option,
                csrfToken: localStorage.getItem("csrfToken")
            }
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                // Show success message
                console.log("VOTED");

                this.props.togglePopupMessage('success', 'Successfully cast vote!');
                this.setState({
                    lastVote: this.parseVote(option),
                    isVoting: false
                });
            }
            else {
                return Promise.reject(response);
            }
        })
        .catch(err => {
            // Show error
            let message = typeof err.message !== 'undefined' ? err.message : "Unable to vote at this time.  You may need to refresh!";

            this.props.togglePopupMessage('error', message);
            this.setState({
                isVoting: false
            });
        })
    }

    render() {
        return this.props.isLive ? (
            <Fragment>
                {
                    this.state.lastVote ? (<p className="text-center">You last voted for: <strong>{this.state.lastVote}</strong></p>) : ""
                }
                <div className="vote-options">
                    <div className="vote-option">
                        {
                            this.props.voteImages && this.props.extraTimeRemaining > 0 ? (
                                <img src={API_URL+"/images/crop0.png?t="+this.props.voteImages} alt="!vote 1" />
                            )
                            :
                            ""
                        }
                        <button type="button" disabled={this.state.isVoting ? "disabled" : ""} className="vote vote-1" onClick={this.vote.bind(this, 1)}>
                            Vote 1
                        </button>
                    </div>
                    <div className="vote-option">
                        {
                            this.props.voteImages && this.props.extraTimeRemaining > 0 ? (
                                <img src={API_URL+"/images/crop1.png?t="+this.props.voteImages} alt="!vote 2" />
                            )
                            :
                            ""
                        }
                        <button type="button" disabled={this.state.isVoting ? "disabled" : ""} className="vote vote-2" onClick={this.vote.bind(this, 2)}>
                            Vote 2
                        </button>
                    </div>

                    <div className="vote-option">
                        {
                            this.props.voteImages && this.props.extraTimeRemaining > 0 ? (
                                <img src={API_URL+"/images/crop2.png?t="+this.props.voteImages} alt="!vote 3" />
                            )
                            :
                            ""
                        }
                        <button type="button" disabled={this.state.isVoting ? "disabled" : ""} className="vote vote-3" onClick={this.vote.bind(this, 3)}>
                            Vote 3
                        </button>
                    </div>

                    <div className="vote-option">
                        {
                            this.props.voteImages && this.props.extraTimeRemaining > 0 ? (
                                <img src={API_URL+"/images/crop3.png?t="+this.props.voteImages} alt="!vote 4" />
                            )
                            :
                            ""
                        }
                        <button type="button" disabled={this.state.isVoting ? "disabled" : ""} className="vote vote-4" onClick={this.vote.bind(this, 4)}>
                            Vote 4
                        </button>
                    </div>
                </div>
                <h3>
                    Custom Votes
                    <small>Seen in the last 2 minutes</small>
                </h3>
                <div className="custom-votes">
                    {
                        this.state.customVotes.length > 0 ?
                        this.state.customVotes.map((customVote, index) => (
                            <CustomVote key={index} disabled={this.state.isVoting ? "disabled" : ""} onClick={this.vote.bind(this, customVote.vote_command)} title={customVote.video_title} image={customVote.video_image} voteCommand={customVote.vote_command} />
                        ))
                        :
                        (
                            <div className="alert alert-dark">No custom votes found.</div>
                        )
                    }
                </div>
                <h3>Your Custom Votes</h3>
                <form>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Search for a video or enter a YouTube URL" />
                        <button type="submit" className="btn">Search</button>
                    </div>
                </form>
            </Fragment>
        )
        :
        (
            <div className="text-center">
                <div className="alert alert-dark">
                    Voting suspended until YogsCinema starts!
                </div>
            </div>
        )
        ;
    }
}

export default VoteOptions;
