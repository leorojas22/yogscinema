const config = require(process.cwd() + "/config");
const Cache = require(process.cwd() + "/helpers/Cache");

class NowPlaying {

	constructor() {
		this.timeRecorded 		= 0;
		this.videoLength 		= 0;
		this.videoTimeElapsed 	= 0;
		this.message			= "";
	}

	get videoEndTime() {
		return this.timeRecorded+(this.videoLength*1000)-(this.videoTimeElapsed*1000);
	}

	get timeRemaining() {
		let videoEndTime 	= this.videoEndTime;
		let timeNow 		= Date.now();

		return (videoEndTime > timeNow) ? Math.floor((videoEndTime - timeNow)/1000) : 0;
	}

	get extraTimeRemaining() {
		let videoEndTime 	= this.videoEndTime + config.voting.additionalVoteTime;
		let timeNow 		= Date.now();

		return (videoEndTime > timeNow) ? Math.floor((videoEndTime - timeNow)/1000) : 0;
	}

	get title() {
		let rawVideoTime = this.constructor.getRawVideoTimeFromMessage(this.message);
		let title = "";
		let nowPlayingTextLength = ("now playing:").length;
		if(rawVideoTime) {
			let rawVideoTimeIndex = this.message.indexOf(rawVideoTime) - nowPlayingTextLength;
			title = (this.message.substr(nowPlayingTextLength, rawVideoTimeIndex)).trim();
		}

		return title;
	}

	getSerialized() {
		return {
			timeRecorded     : this.timeRecorded,
			videoLength      : this.videoLength,
			videoTimeElapsed : this.videoTimeElapsed,
			message          : this.message
		}
	}

	getFormattedData() {
		return {
			title           	: this.title,
			timeRemaining		: this.timeRemaining,
			videoLength     	: this.videoLength,
			extraTimeRemaining	: this.extraTimeRemaining
		}
	}

	static loadFromCache() {
		// Load now playing from the cache

		Cache.get("yogscinema", "nowPlaying").then((result) => {
			let np = new this;
			np.videoTimeElapsed 			= result.videoTimeElapsed;
			np.videoLength 					= result.videoLength;
			np.timeRecorded 				= result.timeRecorded;
			np.message 						= result.message;
			config.chatMonitor.nowPlaying 	= np;
		})
		.catch(err => {});
	}

	static getRawVideoTimeFromMessage(message) {
		let videoTimePattern = /\[\d\d\:\d\d\:\d\d \/ \d\d\:\d\d\:\d\d\]/;
		let rawVideoTime = message.match(videoTimePattern);

		return rawVideoTime;
	}

	static createFromChatMessage(message, chatTime) {

		let lowerCaseMessage = message.toLowerCase();
		if(lowerCaseMessage.substr(0, ("now playing:").length) === "now playing:") {

			let rawVideoTime = this.getRawVideoTimeFromMessage(message);
			if(rawVideoTime) {
				let videoTime = (rawVideoTime[0].replace(/[\[\]]/g, "")).split(" / ");
				if(videoTime.length === 2) {
					let videoTimeSeconds = [];
					// Convert each time value into seconds
					for(let x = 0; x<videoTime.length; x++) {
						let splitTime = videoTime[x].split(":");
						if(splitTime.length === 3) {
							// 0 = Hours
							// 1 = Minutes
							// 2 = Seconds
							let totalSeconds = 0;
							totalSeconds += (parseInt(splitTime[0])*60*60);
							totalSeconds += (parseInt(splitTime[1])*60);
							totalSeconds += parseInt(splitTime[2]);
							videoTimeSeconds.push(totalSeconds);
						}
					}

					let np = new this;
					np.videoTimeElapsed = typeof videoTimeSeconds[0] !== 'undefined' ? videoTimeSeconds[0] : 0;
					np.videoLength 		= typeof videoTimeSeconds[1] !== 'undefined' ? videoTimeSeconds[1] : 0
					np.timeRecorded 	= chatTime;
					np.message 			= message;

					return np;
				}
			}
		}

		return false;

	}

}

module.exports = NowPlaying;
