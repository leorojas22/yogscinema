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
            output.result 		= config.yogsChannel.title.indexOf("YogsCinema") !== -1;
            output.last_checked = config.yogsChannel.last_checked;
            
            let nowPlaying = false;
            if(config.chatMonitor.nowPlaying) {
                nowPlaying = {
                    title           : config.chatMonitor.nowPlaying.title,
                    timeRemaining   : config.chatMonitor.nowPlaying.timeRemaining,
                    videoLength     : config.chatMonitor.nowPlaying.videoLength            
                }
            }
            
            output.nowPlaying = nowPlaying;
            output.voteImages = config.imageProcessing.screenshotSaved;

        }

        res.json(output);
    });
    
};
