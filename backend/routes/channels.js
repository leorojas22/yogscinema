const express = require("express");
const router = express.Router();
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT");

const YoutubeApi = require(process.cwd() + "/helpers/YoutubeApi");
const YogsDB = require(process.cwd() + "/helpers/YogsDB");
const config = require(process.cwd() + "/config");
router.use(verifyJWT);

router.get("/", (req, res) => {
    return YogsDB.getCachedChannels().then(channels => {
        res.json({
            result: true,
            data: channels
        });
    })
    .catch(err => {
        console.log("error");
        res.json({
            result: true,
            data: []
        });
    });
});

router.get("/:channelID/playlists", (req, res) => {
    const yt = new YoutubeApi();
    return yt.getPlaylists(req.params.channelID).then(playlists => {
        res.json({
            result: true,
            data: playlists,
            total: Object.keys(playlists).length
        });
    })
    .catch(err => {
        console.log(err);
        res.json({
            result: true,
            data: []
        });
    });
});

router.get("/:channelID/playlists/:playlistID", (req, res) => {
    const yt = new YoutubeApi();
    return yt.getPlaylistVideos(req.params.playlistID).then(playlistItems => {
        res.json({
            result: true,
            data: playlistItems,
            total: Object.keys(playlistItems).length
        });
    })
    .catch(err => {
        console.log(err);
        res.json({
            result: true,
            data: []
        });
    });
});

module.exports = router;
