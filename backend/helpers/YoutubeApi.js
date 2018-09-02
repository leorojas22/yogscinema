const { google } = require("googleapis");
const config = require(process.cwd() + "/config");
const Cache = require(process.cwd() + "/helpers/Cache");
const youtube = google.youtube({
    version: config.youtube.apiVersion,
    auth: config.youtube.apiKey
})

const CACHE_TIME = 60000;//86400000; // Cache for a day
const CACHE_HASH = "youtube";
const CACHE_PLAYLIST_KEY = "playlists123";
const CACHE_PLAYLIST_ITEMS_KEY = "playlistsItems123";

class YoutubeApi {

    constructor() {
        this.playlists = {};
        this.playlistItems = {};
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

    getBestImage(playlist) {
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

        return bestImageURL;
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
                let bestImageURL = this.getBestImage(playlist);

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

        return this.getCachedPlaylists(channelId).catch(() => {
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


    savePlaylistItems(playlistId, playlistItems) {

        //console.log(playlistItems);

        if(typeof this.playlistItems[playlistId] === 'undefined') {
            this.playlistItems[playlistId] = {};
        }

        for(let x = 0; x < playlistItems.length; x++) {
            let playlistItem = playlistItems[x];

            if(typeof playlistItem.snippet !== 'undefined' && typeof playlistItem.snippet.resourceId !== 'undefined') {

                if(typeof this.playlistItems[playlistId][playlistItem.snippet.resourceId.videoId] === 'undefined') {

                    let videoId = playlistItem.snippet.resourceId.videoId;
                    // Figure out best thumbnail to use
                    let bestImageURL = this.getBestImage(playlistItem);

                    this.playlistItems[playlistId][videoId] = {
                        video_id: videoId,
                        title: playlistItem.snippet.title,
                        image: bestImageURL
                    }
                }

            }
        }

    }


    getCachedPlaylistItems(playlistId) {
        return Cache.get(CACHE_HASH, CACHE_PLAYLIST_ITEMS_KEY).then(result => {
            if(typeof result[playlistId] !== 'undefined') {
                this.playlistItems[playlistId] = result[playlistId];
                console.log("FOUND CACHED VERSION");
                console.log(result[playlistId]);
                return Promise.resolve(result[playlistId]);
            }
            else {
                return Promise.reject();
            }
        });
    }

    getPlaylistVideos(playlistId, nextPageToken = false) {
        let parameters = {
            playlistId: playlistId,
            maxResults: 50,
            part: 'snippet'
        };

        if(nextPageToken) {
            parameters.pageToken = nextPageToken;
        }

        return this.getCachedPlaylistItems(playlistId).catch(() => {
            return youtube.playlistItems.list(parameters).then(result => {
                if(typeof result.data.items !== 'undefined') {
                    // Save the playlist items
                    this.savePlaylistItems(playlistId, result.data.items);

                    if(typeof result.data.nextPageToken !== 'undefined') {
                        // There are additional pages, get the other videos
                        return this.getPlaylistVideos(playlistId, result.data.nextPageToken);
                    }

                }

                if(typeof this.playlistItems[playlistId] === 'undefined') {
                    this.playlistItems[playlistId] = {};
                }

                return this.playlistItems[playlistId];
            })
            .then(result => {
                // Save to cache
                Cache.save(CACHE_HASH, CACHE_PLAYLIST_ITEMS_KEY, this.playlistItems, CACHE_TIME);
                console.log(this.playlistItems[playlistId]);
                return this.playlistItems[playlistId];

            })
            .catch(err => {
                console.log("ERROR");
                console.log(err);
                return Promise.reject();
            });
        });
    }
}

module.exports = YoutubeApi;
