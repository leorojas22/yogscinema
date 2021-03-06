const User = require("./models/User");
const Twitch = require("./helpers/Twitch");
const config = require("./config");
module.exports = (app) => {

    app.get("/twitch-authenticate", (req, res) => {
        res.redirect(Twitch.getAuthenticateURL());
    });

    app.get("/connect", (req, res) => {
        if(typeof req.query.code !== 'undefined') {
            return User.connect(req.query.code).then(user => {
                user.setJWTCookie(res);
                res.redirect(config.siteURL);
            })
            .catch(err => {
                console.log(err);
                res.redirect(config.siteURL+"?error=1");
            });
        }
        else {
            res.redirect(config.siteURL+"?error=1");
        }
    });

    app.get("/is-live", (req,res) => {
        let output = { result: false };
        if(config.yogsChannel) {
			let channelTitle = config.yogsChannel.title.toLowerCase();
            let channelTitleHasYogsCinema   = channelTitle.indexOf("yogscinema") !== -1;
            let channelIsLive               = config.yogsChannel.is_live;
            let gameIsTwitchPlays           = config.yogsChannel.game_id === Twitch.TWITCH_PLAYS;

            output.result = (channelTitleHasYogsCinema || gameIsTwitchPlays) && channelIsLive;
            output.last_checked = config.yogsChannel.last_checked;

            let nowPlaying = false;
            if(config.chatMonitor.nowPlaying) {
                nowPlaying = config.chatMonitor.nowPlaying.getFormattedData();
            }

            output.nowPlaying = nowPlaying;
            output.voteImages = config.imageProcessing.screenshotSaved;

        }

        res.json(output);
    });

};
