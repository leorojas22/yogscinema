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
			output.result 		= config.yogsChannel.title === "YogsCinema!";
			output.last_checked = config.yogsChannel.last_checked;
		}

		res.json(output);
	});
	
};
