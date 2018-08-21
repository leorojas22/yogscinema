const { google } = require("googleapis");
const config = require(process.cwd() + "/config");
const Cache = require(process.cwd() + "/helpers/Cache");
const youtube = google.youtube({
    version: config.youtube.apiVersion,
    auth: config.youtube.apiKey
})

const CACHE_TIME = 86400; // Cache for a day
const CACHE_HASH = "youtube";
const CACHE_PLAYLIST_KEY = "playlists123";
class YoutubeApi {

    constructor() {
        this.playlists = {};
    }

    getCachedPlaylists(channelId) {
        return Cache.get(CACHE_HASH, CACHE_PLAYLIST_KEY).then(result => {
            if(typeof result[channelId] !== 'undefined') {
                this.playlists[channelId] = result[channelId];
                console.log("FOUND CACHED VERSION");
                console.log(result[channelId]);
                return Promise.resolve(result[channelId]);
            }
            else {
                return Promise.reject();
            }
        });
    }

    savePlaylists(channelId, playlistItems) {

        //console.log(playlistItems);

        if(typeof this.playlists[channelId] === 'undefined') {
            this.playlists[channelId] = {};
        }

        for(let x = 0; x < playlistItems.length; x++) {
            let playlist = playlistItems[x];

            if(typeof this.playlists[channelId][playlist.id] === 'undefined') {

                // Figure out best thumbnail to use
                let bestImageURL = "";
                if(typeof playlist.snippet.thumbnails.standard !== 'undefined') {
                    bestImageURL = playlist.snippet.thumbnails.standard.url;
                }
                else if(typeof playlist.snippet.thumbnails.high !== 'undefined') {
                    bestImageURL = playlist.snippet.thumbnails.high.url;
                }
                else if(typeof playlist.snippet.thumbnails.medium !== 'undefined') {
                    bestImageURL = playlist.snippet.thumbnails.medium.url;
                }
                else if(typeof playlist.snippet.thumbnails.standard !== 'undefined') {
                    bestImageURL = playlist.snippet.thumbnails.standard.url;
                }
                else if(typeof playlist.snippet.thumbnails.maxres !== 'undefined') {
                    bestImageURL = playlist.snippet.thumbnails.maxres.url;
                }

                this.playlists[channelId][playlist.id] = {
                    id: playlist.id,
                    title: playlist.snippet.title,
                    image: bestImageURL
                }
            }
        }

    }


    getPlaylists(channelId, nextPageToken = false) {
        let parameters = {
            channelId: channelId,
            maxResults: 50,
            part: 'snippet'
        };

        if(nextPageToken) {
            parameters.pageToken = nextPageToken;
        }

        this.getCachedPlaylists(channelId).catch(() => {
            console.log("NOT CACHED");
            return youtube.playlists.list(parameters).then(result => {
                if(typeof result.data.items !== 'undefined') {
                    this.savePlaylists(channelId, result.data.items);
                    if(typeof result.data.nextPageToken !== 'undefined') {
                        return this.getPlaylists(channelId, result.data.nextPageToken);
                    }
                }

                if(typeof this.playlists[channelId] === 'undefined') {
                    this.playlists[channelId] = {};
                }

                return this.playlists[channelId];
            })
            .then(result => {
                // Save to cache
                Cache.save(CACHE_HASH, CACHE_PLAYLIST_KEY, this.playlists, CACHE_TIME);
                return this.playlists[channelId];
            })
            .catch(err => {
                console.log(err);
                return Promise.reject();
            });

        });


    }
}

module.exports = YoutubeApi;
