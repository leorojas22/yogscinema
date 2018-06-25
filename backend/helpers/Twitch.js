const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/";
const TWITCH_API_URL = "https://api.twitch.tv/helix/";
const config = require(process.cwd() + "/config");
const request = require("request");

class Twitch {

	static getUserInfo(token) {
		return new Promise((resolve, reject) => {
			request({
				url: TWITCH_API_URL + "users",
				headers: {
					Authorization: 'Bearer '+token
				}
			}, (err, response, body) => {
				if(err) {
					return reject({ message: "Unable to access user." });
				}

				let result = JSON.parse(body);
				if(typeof result.error === 'undefined') {
					return resolve(result.data[0]);
				}
				else {
					return reject(result);
				}
			})
		});
	}

	static connect(token) {

		let queryStringObj = {
			client_id		: config.twitch.clientID,
			client_secret	: config.twitch.clientSecret,
			code			: token,
			grant_type		: 'authorization_code',
			redirect_uri	: config.twitch.redirectURL
		};

		let queryString = [];

		for(let field in queryStringObj) {
			queryString.push(field+"="+queryStringObj[field]);
		}

		queryString = "?" + queryString.join("&");
		return new Promise((resolve, reject) => {
			request({
				url		: TWITCH_OAUTH_URL + "token" + queryString,
				method	: "POST",
				headers: {
					'Client-ID': config.twitch.clientID
				}
			}, (err, data, body) => {
				if(err) {
					console.log(err);
					return reject({ message: "Unable to connect with Twitch." });
				}

				let result = JSON.parse(body);
				if(typeof result.error === 'undefined') {
					return resolve(result);
				}
				else {
					return reject(result);
				}
			});
		});
		
	}

	static refreshToken(token) {
		return new Promise((resolve, reject) => {
			request({
				url		: TWITCH_OAUTH_URL + "token",
				method	: "POST",
				headers: {
					'Client-ID': config.twitch.clientID
				},
				form	: {
					grant_type		: "refresh_token",
					refresh_token	: token,
					client_id		: config.twitch.clientID,
					client_secret	: config.twitch.clientSecret
				}
			}, (err, response, body) => {
				if(err) {
					return reject({ message: "Unable to refresh Twitch access." })
				}

				let result = JSON.parse(body);
				if(typeof result.error === 'undefined') {
					return resolve(result);
				}
				else {
					return reject(result);
				}
			});
		});
	}

	static getAuthenticateURL() {
		return TWITCH_OAUTH_URL + "authorize?client_id=" + config.twitch.clientID + "&redirect_uri=" + config.twitch.redirectURL + "&response_type=code&scope=" + config.twitch.scope;
	}

	static getChannelInfo(channel) {
		return new Promise((resolve, reject) => {
			request({
				url: TWITCH_API_URL + "streams?user_login="+channel,
				headers: {
					'Client-ID': config.twitch.clientID
				}
			}, (err, response, body) => {
				if(err) {
					return reject({ message: "Unable to access channel." });
				}

				let result = JSON.parse(body);
				if(typeof result.data !== 'undefined' && result.data.length > 0 && typeof result.error === 'undefined') {
					return resolve(result.data[0]);
				}
				else {
					return reject(result);
				}
			})
		});
	}

	static revokeAccess(token) {
		let queryStringObj = {
			client_id	: config.twitch.clientID,
			token		: token,
		};

		let queryString = [];

		for(let field in queryStringObj) {
			queryString.push(field+"="+queryStringObj[field]);
		}

		queryString = "?" + queryString.join("&");
		return new Promise((resolve, reject) => {
			request({
				url		: TWITCH_OAUTH_URL + "revoke" + queryString,
				method	: "POST"
			}, (err, data, body) => {
				if(err) {
					console.log(err);
					return reject({ message: "Unable to revoke access.  You will have to do it manually through your Twitch dashboard." });
				}

				let result = (""+body).trim();
				
				if(result === "") {
					return resolve(true);
				}
				else {
					return reject(false);
				}
			});
		});
	}
}

module.exports = Twitch;
