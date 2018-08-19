import React, { Fragment } from 'react';
import CustomVote from './CustomVote';
import { ajaxHelper } from '../helpers/ajax';
import config from '../config';
import VoteQueue from './VoteQueue';
import CustomVoteList from './CustomVoteList';

const API_URL = config.apiURL;

class VoteOptions extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isVoting: false,
            customVotes: [],
            lastVote: false,
            voteQueue: []
        }

        this.vote = this.vote.bind(this);
        this.updateVoteQueue = this.updateVoteQueue.bind(this);
        this.filterCustomVotes = this.filterCustomVotes.bind(this);
    }

    updateVoteQueue(voteQueue) {
        this.setState({
            voteQueue
        });
    }

    parseVote(option) {
        let lastVote = option;
        if(isNaN(option)) {
            // Search through customVotes to get title

            if(typeof option === 'object' && typeof option.id !== 'undefined') {

                let foundVote = false;
                if(this.state.voteQueue.length > 0) {
                    for(let x=0;x<this.state.voteQueue.length; x++) {
                        let voteQueue = this.state.voteQueue[x];
                        if(voteQueue.id === option.id) {
                            lastVote = voteQueue.video_title;
                            foundVote = true;
                            break;
                        }
                    }
                }

                if(!foundVote) {
                    lastVote = false;
                }

            }
            else if(this.state.customVotes.length > 0) {
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

    // Filters custom votes seen in the channel and removes any that were added by the user
    filterCustomVotes(customVotesResponse) {

        if(this.state.voteQueue.length > 0) {
            let filteredVotes = [];
            for(let y = 0; y < customVotesResponse.length; y++) {
                let foundVote = false;
                let customVote = customVotesResponse[y];
                for(let x = 0; x < this.state.voteQueue.length; x++) {
                    let addedVote = this.state.voteQueue[x];
                    if(customVote.youtube_id === addedVote.youtube_id) {
                        foundVote = true;
                        break;
                    }
                }

                if(!foundVote) {
                    filteredVotes.push(customVote);
                }
            }

            return filteredVotes;
        }


        return customVotesResponse;
    }


    checkForCustomVotes() {

        ajaxHelper("/votes", {
            method: "GET"
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                this.setState({
                    customVotes: this.filterCustomVotes(response.data)
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
                <CustomVoteList
                    customVotes={this.state.customVotes}
                    isVoting={this.state.isVoting}
                    vote={this.vote}
                    noVotesMessage="No custom votes found."
                />
                <hr />
                <VoteQueue
                    togglePopupMessage={this.props.togglePopupMessage}
                    isVoting={this.state.isVoting}
                    vote={this.vote}
                    voteQueue={this.state.voteQueue}
                    updateVoteQueue={this.updateVoteQueue}
                    user={this.props.user}
                />
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
