const BaseModel = require(process.cwd() + "/models/BaseModel");
const YogsDB = require(process.cwd() + "/helpers/YogsDB");
const tmi = require("tmi.js");
const config = require(process.cwd() + "/config");

class VoteQueue extends BaseModel {

    static get tableName() {
        return "vote_queue";
    }

    static createFromSearch(options) {
        let { user, searchTerm } = options;

        // Search yogsdb
        return YogsDB.searchTitleOrYoutubeID(searchTerm).then(result => {
            // Found video in yogsdb

            // Check if there is already a non-expired, non-deleted votequeue
            let searchQueue = {
                user_id     : user.id,
                youtube_id  : result.youtube_id,
                video_image : result.image,
                video_title : result.title,
                deleted     : null
            };

            return this.getOrCreate(searchQueue).catch(err => { return Promise.reject("CREATEFAIL") });
        })
        .catch(err => {

            let formattedError = { result: false, message: "" };
            if(err === false) {
                formattedError.message = "No results found.";
            }
            else {
                formattedError.message = "Unable to add new vote at this time.  Please try again later.";
            }

            return Promise.reject(formattedError);
        });
    }

}

module.exports = VoteQueue;
