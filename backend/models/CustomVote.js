const BaseModel = require(process.cwd() + "/models/BaseModel");
const YogsDB = require(process.cwd() + "/helpers/YogsDB");
const tmi = require("tmi.js");
const config = require(process.cwd() + "/config");
const NowPlaying = require(process.cwd() + "/helpers/NowPlaying");
const Cache = require(process.cwd() + "/helpers/Cache");

class CustomVote extends BaseModel {

    static get tableName() {
        return "custom_votes";
    }

    static get LOOKBACK_TIME() {
        // Look back 2 minutes
        return 120000;
    }

    static get TYPE_VOTE_ADD() {
        return 1;
    }

    static get TYPE_VOTE() {
        return 2;
    }

    get full_vote_command() {
        return "!vote " + this.vote_command;
    }

    static async findRecent(where = {}, distinct = false) {

        let lookBackTimestamp 	= Date.now() - CustomVote.LOOKBACK_TIME;
        let lookBackTime 		= new Date(lookBackTimestamp);

        let results = null;
        if(distinct) {
            results = await this.query().distinct('vote_command','video_title','video_image','youtube_id').where(where).where("created", ">=", lookBackTime);
        }
        else {
            results = await this.query().where(where).where("created", ">=", lookBackTime);
        }

        if(results.length > 0) {
            return results;
        }
        else {
            return Promise.reject(false);
        }
    }

    static getVoteInfo(voteText) {
        let beginVoteCommand 	= "!vote ";
        let beginVoteAddCommand = "!voteadd ";

        let beginTextVoteCheck 		= voteText.substr(0,beginVoteCommand.length);
        let beginTextVoteAddCheck 	= voteText.substr(0, beginVoteAddCommand.length);

        let voteLookup = false;
        let voteType = false;
        if(beginTextVoteCheck === beginVoteCommand) {
            // Vote command
            voteLookup = voteText.substr(beginVoteCommand.length);
            voteType = "vote_command";
            let beginsWithC = voteLookup.substr(0, 1) === "c";
            if(!beginsWithC || (beginsWithC && isNaN(voteLookup.substr(1)))) {
                // If the !vote command is used without being formatted correctly, return false (correct format ex: c12345)
                return false;
            }
        }
        else if(beginTextVoteAddCheck === beginVoteAddCommand) {
            // Vote add command
            voteLookup = voteText.substr(beginVoteAddCommand.length);
            voteType = "vote_add_command";
        }

        if(voteLookup) {
            return {
                type: voteType,
                vote: voteLookup
            }
        }
        else {
            return false;
        }
    }

    static async verify(voteText) {

        let voteCheck = CustomVote.getVoteInfo(voteText);
        if(voteCheck) {
            // Check if we have it stored in the db already
            let search = {};
            search[voteCheck.type] = voteCheck.vote;

            return CustomVote.find(search).then(result => {

                if(typeof result.youtube_id === 'undefined' || (typeof result.youtube_id !== 'undefined' && !result.youtube_id)) {
                    // For future proofing, if we dont have the youtube_id saved, look up the video again.
                    return Promise.reject();
                }

                let id = result.vote_command.substr(1);
                return {
                    id: id,
                    image: result.video_image,
                    title: result.video_title,
                    full_vote_command: "!vote " + result.vote_command,
                    youtube_id: result.youtube_id
                };
            })
            .catch(err => {
                // Vote not found in our db, check if we can find it in yogsdb

                if(YogsDB.determineSearchTermType(voteCheck.vote) === YogsDB.ID_SEARCH) {
                    // Look up by id
                    return YogsDB.getVideo(voteCheck.vote);
                }
                else {
                    // Look up by either youtube_id or title
                    return YogsDB.searchTitleOrYoutubeID(voteCheck.vote);
                }

            });
        }

        return Promise.reject(false);

    }

    static monitorChatForVotes() {
        let opts = {
            identity: {
                username: config.chatMonitor.username,
                password: "oauth:"+config.chatMonitor.password
            },
            channels: [
                config.chatMonitor.channel
            ]
        }

        let client = new tmi.client(opts);

        client.on("disconnected", function(reason) {
            console.log("DISCONNECTED YCVBOT - "+Date.now());
            console.log("REASON: "+reason);

            // When we are disconnected - wait 2 minutes and try to reconnect
            setTimeout(() => {
                client.connect();
            }, 120000);

        });

        client.on("message", (channel, userstate, message, self) => {
            if(self) {
                return;
            }

            let timeNow = Date.now();
            let voteInfo = CustomVote.getVoteInfo(message);
            if(voteInfo) {
                let defaultOptions = [1,2,3,4];
                if(!isNaN(voteInfo.vote) && voteInfo.vote.length === 1 && defaultOptions.indexOf(parseInt(voteInfo.vote)) !== -1) {
                    return;
                }

                CustomVote.verify(message).then(result => {
                    // Check to make sure it isn't already saved recently
                    let search = {
                        vote_command: 'c'+result.id
                    }

                    CustomVote.findRecent(search).then(recentVote => {}).catch(() => {
                        // Save recent
                        let saveInfo = Object.assign({
                            video_image : result.image,
                            video_title : result.title,
                            youtube_id  : result.youtube_id
                        }, search);
                        if(voteInfo.type === "vote_add_command") {
                            saveInfo.vote_add_command = voteInfo.vote;
                        }
                        else {
                            saveInfo.vote_add_command = search.vote_command;
                        }

                        CustomVote.query().insert(saveInfo).then(customVote => {
                            console.log(customVote);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    });

                })
                .catch(err => {
                    console.log("ERROR");
                    console.log(err);
                })
            }
            else if(userstate.username.toLowerCase() === config.chatMonitor.cinemaBot) {
                // Check if jaffa mod has said "Now Playing..."
                // Example Now Playing message: "Now playing: Minecraft - MoonQuest 42 - King of the Squids [00:01:25 / 00:17:37] - Cinema schedule: https://bit.ly/cinemaschedule"
                let nowPlaying = NowPlaying.createFromChatMessage(message, timeNow);
                if(nowPlaying) {

                    // Save now playing to cache
                    Cache.save("yogscinema", "nowPlaying", nowPlaying.getSerialized());
                    config.chatMonitor.nowPlaying = nowPlaying;
                }
            }

        });
        client.connect().then(result => {
            console.log("connected")
        })
        .catch(err => {
            console.log("ERROR");
            console.log(err);
        })
    }

}

module.exports = CustomVote;
