import React, { Fragment } from 'react';
import { ajaxHelper } from '../helpers/ajax';
import CustomVoteList from './CustomVoteList';
import Checkbox from './Checkbox';

class VoteQueue extends React.Component {

    constructor(props) {
        super(props);

        let removeIfWins = true;
        if(typeof props.user !== 'undefined' && typeof props.user.remove_vote_queue_if_wins !== 'undefined') {
            removeIfWins = props.user.remove_vote_queue_if_wins;
        }

        this.state = {
            searchTerm: "",
            searching: false,
            removeIfWins: removeIfWins,
            deletingVote: false
        }

        this.handleFormInput    = this.handleFormInput.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.loadVoteQueue      = this.loadVoteQueue.bind(this);
        this.toggleRemoveIfWins = this.toggleRemoveIfWins.bind(this);
        this.emptyQueue         = this.emptyQueue.bind(this);
        this.removeVoteQueue    = this.removeVoteQueue.bind(this);
    }

    componentDidMount() {
        this.loadVoteQueue();
    }

    loadVoteQueue() {
        ajaxHelper("/user/vote-queue", {
            method: "GET"
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                this.props.updateVoteQueue(response.data);
            }
        })
        .catch(err => {
            // do nothing
        });


        setTimeout(() => {
            this.loadVoteQueue();
        }, 10000);

    }

    handleFormInput(e) {
        if(typeof e.target.name !== 'undefined' && this.state[e.target.name] !== 'undefined') {
            let name = e.target.name;
            let newState = {};

            newState[name] = e.target.value;

            this.setState(newState);
        }
    }

    handleSearchSubmit(e) {
        e.preventDefault();

        if(this.state.searching) {
            return false;
        }

        this.setState({
            searching: true
        });

        ajaxHelper("/user/vote-queue", {
            method: "POST",
            body: {
                searchTerm: this.state.searchTerm,
                csrfToken: localStorage.getItem("csrfToken")
            }
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result && typeof response.data !== 'undefined') {
                // Show success message

                if(!Array.isArray(response.data)) {
                    console.log(response.data);
                    let currentVoteQueue = this.props.voteQueue;
                    currentVoteQueue.unshift(response.data);

                    this.props.updateVoteQueue(currentVoteQueue);
                    this.setState({
                        searching: false,
                        searchTerm: ""
                    });
                }

            }
            else {
                return Promise.reject(response);
            }
        })
        .catch(err => {
            // Show error
            let message = typeof err.message !== 'undefined' ? err.message : "Unable to search for videos at this time.  You may need to refresh!";

            this.props.togglePopupMessage('error', message);
            this.setState({
                searching: false
            });
        })
    }

    toggleRemoveIfWins() {
        let removeIfWins = !this.state.removeIfWins;

        this.setState({
            removeIfWins
        });

        ajaxHelper("/user", {
            method: "PATCH",
            body: {
                removeVoteQueueIfWins: removeIfWins ? 1 : 0,
                csrfToken: localStorage.getItem("csrfToken")
            }
        })
        .catch(err => {
            // Show error
            let message = typeof err.message !== 'undefined' ? err.message : "An error occurred while saving your settings.  You may need to refresh!";

            this.props.togglePopupMessage('error', message);
            this.setState({
                removeIfWins: !removeIfWins
            });
        })



    }

    removeVoteQueue(voteQueue) {

        if(this.deletingVote) {
            return false;
        }

        this.setState({
            deletingVote: true
        });

        ajaxHelper("/user/vote-queue/"+voteQueue.id, {
            method: "DELETE",
            body: {
                csrfToken: localStorage.getItem("csrfToken")
            }
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                // Show success message

                if(this.props.voteQueue.length > 0) {
                    let customVotes = this.props.voteQueue;
                    for(let x = 0; x < customVotes.length; x++) {
                        if(parseInt(voteQueue.id) === parseInt(customVotes[x].id)) {
                            let updatedVoteQueue = this.props.voteQueue;
                            updatedVoteQueue.splice(x, 1);
                            this.props.updateVoteQueue(updatedVoteQueue);
                            break;
                        }
                    }
                }

            }
            else {
                return Promise.reject(response);
            }
        })
        .catch(err => {
            // Show error
            let message = typeof err.message !== 'undefined' ? err.message : "Unable to empty queue at this time.  You may need to refresh!";

            this.props.togglePopupMessage('error', message);
            this.setState({
                searching: false
            });
        });
    }

    emptyQueue() {

        if(this.deletingVote) {
            return false;
        }

        this.setState({
            deletingVote: true
        });

        ajaxHelper("/user/vote-queue/empty", {
            method: "POST",
            body: {
                csrfToken: localStorage.getItem("csrfToken")
            }
        }).then(response => {
            if(typeof response.result !== 'undefined' && response.result) {
                // Show success message
                this.props.updateVoteQueue([]);
            }
            else {
                return Promise.reject(response);
            }
        })
        .catch(err => {
            // Show error
            let message = typeof err.message !== 'undefined' ? err.message : "Unable to empty queue at this time.  You may need to refresh!";

            this.props.togglePopupMessage('error', message);
            this.setState({
                searching: false
            });
        })
    }

    render() {

        return (
            <Fragment>
                <h3 className="mb-sm">Your Vote Queue</h3>
                <div className="vote-queue-options">
                    <div className="pull-left">
                        <a onClick={this.emptyQueue}><i className="far fa-trash-alt"/> Empty Queue</a>
                    </div>
                    <div className="pull-right">
                        <Checkbox
                            label="Remove if wins"
                            onClick={this.toggleRemoveIfWins}
                            checked={this.state.removeIfWins}
                        />
                    </div>
                </div>
                <CustomVoteList
                    customVotes={this.props.voteQueue}
                    isVoting={this.props.isVoting}
                    vote={this.props.vote}
                    updateVoteQueue={this.props.updateVoteQueue}
                    noVotesMessage="No votes in your queue!"
                    removeVoteQueue={this.removeVoteQueue}
                />
                <form onSubmit={this.handleSearchSubmit} style={{ marginTop: "20px"}} >
                    <div className="form-group">
                        <input type="text" className="form-control" name="searchTerm" placeholder="Search for a video" value={this.state.searchTerm} onChange={this.handleFormInput} />
                        <button type="submit" className="btn" disabled={this.state.searching}>
                            {
                                this.state.searching ?
                                (
                                    <Fragment>
                                        <i className="fa fa-spinner fa-spin" /> Searching...
                                    </Fragment>
                                )
                                :
                                "Search"
                            }
                        </button>
                    </div>
                </form>
            </Fragment>
        );
    }
}

export default VoteQueue;
