import React from 'react';
import CustomVote from './CustomVote';

class CustomVoteList extends React.Component {

    constructor(props) {
        super(props);

        this.vote = this.vote.bind(this);
        this.removeVoteQueue = this.removeVoteQueue.bind(this);
    }

    vote(customVote) {

        let voteCommand = customVote.vote_command;
        if(typeof customVote.vote_type !== 'undefined' && customVote.vote_type === "voteadd") {
            voteCommand = { id: customVote.id };
        }

        this.props.vote(voteCommand);
    }

    removeVoteQueue(customVote) {
        if(typeof this.props.removeVoteQueue !== 'undefined') {
            this.props.removeVoteQueue(customVote);
        }
    }

    render() {
        const props = this.props;

        return (
            <div className="custom-votes">
                {
                    props.customVotes.length > 0 ?
                    props.customVotes.map((customVote, index) => (
                        <CustomVote
                            key={index}
                            disabled={props.isVoting ? "disabled" : ""}
                            onClick={this.vote.bind(this, customVote)}
                            customVote={customVote}
                            removeVoteQueue={this.removeVoteQueue.bind(this, customVote)}
                        />
                    ))
                    :
                    (
                        <div className="alert alert-dark">{props.noVotesMessage}</div>
                    )
                }
            </div>
        );
    }
}

export default CustomVoteList;
