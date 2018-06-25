const Twitch = require(process.cwd() + "/helpers/Twitch");
const config = require(process.cwd() + "/config");

class Cron {

	static checkYogsChannel() {
		Twitch.getChannelInfo("yogscast").then(result => {
			config.yogsChannel = { 
				title: result.title,
				last_checked: new Date()
			};
		})
		.catch(err => {
			console.log("ERROR CHECKING CHANNEL");
			console.log(err);	
		});
	}
}

module.exports = Cron;
