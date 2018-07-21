const BaseModel 			= require(process.cwd() + "/models/BaseModel");
const { encrypt, decrypt } 	= require(process.cwd() + "/helpers/crypto.js");
const tmi 					= require("tmi.js");
const Twitch 				= require(process.cwd() + "/helpers/Twitch");
const jwt 					= require("jsonwebtoken");
const config 				= require(process.cwd() + "/config");
const moment				= require("moment");
const CustomVote			= require(process.cwd() + "/models/CustomVote");
const md5					= require("md5");

const TWITCH_CHANNEL 		= config.voting.channel;
const WAIT_BETWEEN_VOTES 	= config.voting.waitTime;

class User extends BaseModel {
    static get tableName() {
        return "users";
    }

    async saveToken(token) {
        let encryptedToken = encrypt(token);
        this.token = encryptedToken;
        return await User.query().updateAndFetchById(this.id, { token: encryptedToken });
    }

    get accessToken() {
        let tokens = JSON.parse(decrypt(this.token));
        return tokens.accessToken;
    }

    get refreshToken() {
        let tokens = JSON.parse(decrypt(this.token));
        return tokens.refreshToken;
    }

    verifyAccessToken() {
        return Twitch.getUserInfo(this.accessToken)
            .then(result => Promise.resolve(this))
            .catch(err => {
                return Twitch.refreshToken(this.refreshToken).then(result => {
                    let tokens = {
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token
                    }
                    console.log(tokens);
                    return this.saveToken(JSON.stringify(tokens));
                })
            });
    }

    validateVote(option) {

        let lastMessage = moment(this.last_vote_time);
        let now 		= moment();
        let diff 		= now.diff(lastMessage, 'seconds');

        if(diff < WAIT_BETWEEN_VOTES) {
            return Promise.reject({ message: "Please wait 1 minute before voting again." });
        }

        let predefinedValues = [1,2,3,4];
        if(predefinedValues.indexOf(parseInt(option)) !== -1) {
            return Promise.resolve(true);
        }

        // Custom option
        // Check to make sure its valid
        return CustomVote.verify("!vote "+option);
    }

    vote(option) {

        return this.validateVote(option).then(() => {
            console.log("VALID VOTE");
            return this.verifyAccessToken().then(() => {
                console.log("VALID ACCESS TOKEN");

                let opts = {
                    identity: {
                        username: this.username,
                        password: "oauth:"+this.accessToken
                    },
                    channels: [
                        TWITCH_CHANNEL
                    ]
                }
        
                let client = new tmi.client(opts);
        
                return client.connect().then(() => {
                    // Send message
                    return client.say(TWITCH_CHANNEL, "!vote "+option);
                })
                .then(() => {

                    // Update last message sent
                    let updateLastMessage = User.query().update({ last_vote_time: new Date(), last_vote: option }).where({ id: this.id });

                    // Disconnect
                    let disconnect = client.disconnect();

                    return Promise.all([updateLastMessage, disconnect]);
                })
                .catch(err => {
                    return Promise.reject({ err: "Unable to vote at this time." });
                });
            })
        });
        
    }

    getJWT(csrfToken = false) {
        var obj = {
            user_id	: this.id,
            exp		: Math.floor((Date.now() / 1000) + (60*60*14)),
        }

        if(csrfToken) {
            obj.csrf = csrfToken;
        }

        return jwt.sign(obj, config.jwtKey);
    }

    static connect(token) {

        let tokens = {};
        return Twitch.connect(token).then(result => {
            tokens = {
                accessToken: result.access_token,
                refreshToken: result.refresh_token
            }

            return Twitch.getUserInfo(tokens.accessToken);
        })
        .then(userInfo => {
            // Check to see if we have this user in our system
            return User.getOrCreate({ username: userInfo.login });
        })
        .then(user => {
            // Update token
            return user.saveToken(JSON.stringify(tokens));
        })
        .catch(err => {
            console.log(err);
            return Promise.reject({ message: "Unable to connect with Twitch." });
        })
    }

    static getByJWT(token) {
        try {
            var decoded = jwt.verify(token, config.jwtKey);
            return this.find({ id: decoded.user_id, deleted: null }).then(user => {
                user.jwt = decoded;
                return user
            });
        }
        catch(err) {
            console.log(err);
            return Promise.reject();
        }
    }

    revokeAccess(res) {
        return Twitch.revokeAccess(this.accessToken).then(() => {
            res.clearCookie("jwt");
            return User.query().update({ token: "" }).where({ id: this.id });	
        });
    }


    setJWTCookie(res, setCsrf = false) {
        let csrfToken = false;
        if(setCsrf) {
            let randomNum 	= (Math.random()*1000)+1000;
            let now 		= Date.now();
            csrfToken 		= md5(""+randomNum+now);
            res.set("x-csrf-token", csrfToken);
        }

        let cookieSettings = { httpOnly: true, expires: new Date(Date.now() + (1000*60*60*24*30)) };
        if(!config.isDev) {
            cookieSettings.secure = true;
        }

        res.cookie("jwt", this.getJWT(csrfToken), cookieSettings);
    }

    $formatJson(json) {
        json = super.$formatJson(json);

        return {
            id				: json.id,
            username		: json.username,
            last_vote		: json.last_vote,
            last_vote_time	: json.last_vote_time
        }
    }

}

module.exports = User;
