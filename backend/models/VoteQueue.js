const BaseModel = require(process.cwd() + "/models/BaseModel");
const YogsDB = require(process.cwd() + "/helpers/YogsDB");
const tmi = require("tmi.js");
const config = require(process.cwd() + "/config");
const url = require("url");
const querystring = require("querystring");

class VoteQueue extends BaseModel {

    static get tableName() {
        return "vote_queue";
    }

    get vote_command() {
        return "!voteadd " + this.youtube_id;
    }


    static async deleteForUser(user) {
        return await this.query().update({ deleted: new Date() }).where({ user_id: user.id, deleted: null });
    }

    static createFromSearch(options) {
        let { user, searchTerm } = options;

        if(typeof user !== 'undefined' && typeof searchTerm !== 'undefined' && searchTerm !== "") {
            // Check if the searchTerm is a url
            let checkSearchTerm = url.parse(searchTerm);
            if(checkSearchTerm.hostname && checkSearchTerm.hostname.indexOf("youtube.com") !== -1) {
                // Found youtube url

                // Pull out the v querystring
                let ytQuerystring = querystring.parse(checkSearchTerm.query);
                if(typeof ytQuerystring.v !== 'undefined') {
                    searchTerm = ytQuerystring.v;
                }
            }

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
                console.log(searchQueue);
                return this.getOrCreate(searchQueue).catch(err => { return Promise.reject("CREATEFAIL") });
            })
            .then(voteQueue => {
                console.log(voteQueue);
                return voteQueue;
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
        else {
            return Promise.reject({ result: false, message: "Search term cannot be blank!" });
        }
    }

    $formatJson(json) {
        json = super.$formatJson(json);

        json.vote_command = json.youtube_id;
        json.vote_type = "voteadd";
        return json;
    }

}

module.exports = VoteQueue;
