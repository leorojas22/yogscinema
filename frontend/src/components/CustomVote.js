import React from 'react';

const CustomVote = (props) => {

    const customVote = props.customVote;

    return (
        <div className="custom-vote">
            {
                typeof customVote.vote_type !== 'undefined' && customVote.vote_type === "voteadd" ?
                (
                    <div className="remove-vote">
                        <span onClick={props.removeVoteQueue}><i className="fa fa-times" /> Remove</span>
                    </div>
                )
                :
                ""
            }
            <img src={customVote.video_image} alt={"!"+(typeof customVote.vote_type !== 'undefined' ? customVote.vote_type : "vote")+" "+customVote.vote_command} />
            <p>{customVote.video_title}</p>
            <button type="button" disabled={props.disabled} onClick={props.onClick}>
                !{typeof customVote.vote_type !== 'undefined' ? customVote.vote_type : "vote"} {customVote.vote_command}
            </button>
            <a href={"https://www.youtube.com/watch?v="+customVote.youtube_id} className="btn youtube-link" target="_blank">Watch on YT</a>
        </div>
    );
}

export default CustomVote;
