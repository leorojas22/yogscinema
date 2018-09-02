const request = require("request");
const Cache = require(process.cwd() + "/helpers/Cache");
const { sha1, base64 } = require(process.cwd() + "/helpers/crypto");

const YOGDB_API_URL        = "https://api.yogsdb.com/api";
const YOGSLIVE_CHANNEL_ID  = 32;
const YOGSDB_REDIS_HASH    = "yogsdb";
const CACHE_EXPIRE_TIME    = 1200000;//259200000; // 3 days
const YOGSDB_CHANNEL_KEY   = "channelCache";
class YogsDB {

    static get ID_SEARCH() {
        return 1;
    }

    static get TEXT_SEARCH() {
        return 2;
    }

    static validateSearchKeys(where) {
        // There are more, but we will only be searching by these keys
        let validKeys = [
            'youtube_id',
            'title'
        ];

        for(let key in where) {
            if(validKeys.indexOf(key) === -1) {
                return false;
            }
        }

        return true;
    }

    static determineSearchTermType(searchTerm) {
        if((""+searchTerm).substr(0,1) === "c") {
            let id = (""+searchTerm).substr(1);
            if(!isNaN(id)) {
                return YogsDB.ID_SEARCH;
            }
        }

        return YogsDB.TEXT_SEARCH;
    }


    static getVideo(id) {

        // Check if there is a "c" in front of the id
        if((""+id).substr(0,1) === "c") {
            id = (""+id).substr(1);
        }


        if(isNaN(id)) {
            return Promise.reject(false);
        }

        return Cache.get(YOGSDB_REDIS_HASH, id).catch((err) => {
            return new Promise((resolve, reject) => {
                request({
                    url: YOGDB_API_URL + "/videos/"+id,
                    method: "GET"
                }, (err, response, body) => {
                    if(err) {
                        console.log(err);
                        return reject(err);
                    }

                    let result = JSON.parse(body);
                    if(Object.keys(result).length > 0) {
                        Cache.save(YOGSDB_REDIS_HASH, id, result, CACHE_EXPIRE_TIME);
                        return resolve(result);
                    }

                    return reject(false);

                });
            });
        });

    }

    static searchTitleOrYoutubeID(searchTerm) {
        return YogsDB.searchVideos({ title: searchTerm }).then(result => {
            return result;
        })
        .catch(err => {
            return YogsDB.searchVideos({ youtube_id: searchTerm });
        });
    }

    static searchVideos(where = {} ) {

        if(!YogsDB.validateSearchKeys(where)) {
            return Promise.reject(false);
        }

        let whereQuery = [];
        for(let x in where) {
            whereQuery.push(x+"="+where[x]);
        }

        whereQuery = "?" + whereQuery.join("&");

        // Check if the query is stored in redis

        return Cache.get(YOGSDB_REDIS_HASH, whereQuery).catch((err) => {
            // Could not find cached result, perform the search

            return new Promise((resolve, reject) => {
                request({
                    url: YOGDB_API_URL + "/videos" + whereQuery,
                    method: "GET"
                }, (err, response, body) => {

                    if(err) {
                        console.log(err);
                        return reject(err);
                    }

                    let result = JSON.parse(body);
                    if(typeof result.data !== 'undefined' && result.data.length > 0) {
                        let firstValidResult = false;
                        for(let x=0; x<result.data.length;x++) {
                            let video = result.data[x];
                            if(video.channel.id !== YOGSLIVE_CHANNEL_ID) {
                                firstValidResult = video;
                                break;
                            }
                        }

                        if(firstValidResult) {
                            // Cache the result
                            Cache.save(YOGSDB_REDIS_HASH, whereQuery, firstValidResult, CACHE_EXPIRE_TIME);
                            return resolve(firstValidResult);
                        }
                    }

                    return reject(false);

                });
            });
        });
    }

    static getCachedChannels() {
        return Cache.get(YOGSDB_REDIS_HASH, YOGSDB_CHANNEL_KEY).catch((err) => {
            console.log("CHANNELS NOT CACHED");
            return YogsDB.getChannels().then(channels => {
                Cache.save(YOGSDB_REDIS_HASH, YOGSDB_CHANNEL_KEY, channels, CACHE_EXPIRE_TIME);
                console.log("SAVED TO CACHE");
                console.log(channels);
                return Promise.resolve(channels);
            })
            .catch(err => {
                console.log("ERROR");
                console.log(err);
                return Promise.resolve([]);
            })
        });
    }

    static getChannels(apiURL = false, channels = []) {
        // Use yogs db to get all yogs channels except for yogslive

        return new Promise((resolve, reject) => {
            let yogsDBUrl = apiURL ? apiURL : YOGDB_API_URL + "/channels"
            request({
                url: yogsDBUrl,
                method: "GET"
            }, (err, response, body) => {

                if(err) {
                    console.log(err);
                    return reject(err);
                }

                let result = JSON.parse(body);
                if(typeof result.data !== 'undefined' && result.data.length > 0) {
                    for(let x = 0; x < result.data.length; x++) {
                        let channel = result.data[x];
                        if(parseInt(channel.id) !== YOGSLIVE_CHANNEL_ID) {
                            channels.push({
                                youtube_id  : channel.youtube_id,
                                title       : channel.title,
                                image       : channel.image
                            });
                        }
                    }

                    if(typeof result.next_page_url !== 'undefined') {
                        if(result.next_page_url) {
                            console.log(result.next_page_url);
                            resolve(YogsDB.getChannels(result.next_page_url, channels));
                        }
                        else {
                            //console.log("ALLCHANNELS:");
                            //console.log(channels);
                            resolve(channels);
                        }
                    }
                }

                reject();

            });
        });

    }
}

module.exports = YogsDB;
