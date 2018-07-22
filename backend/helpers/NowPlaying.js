class NowPlaying {

	constructor() {
		this.timeRecorded 		= 0;
		this.videoLength 		= 0;
		this.videoTimeElapsed 	= 0;
		this.message			= "";
	}

	get timeRemaining() {
		let videoEndTime 	= this.timeRecorded+(this.videoLength*1000)-(this.videoTimeElapsed*1000);
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

	static getRawVideoTimeFromMessage(message) {
		let videoTimePattern = /\[\d\d\:\d\d\:\d\d \/ \d\d\:\d\d\:\d\d\]/;
		let rawVideoTime = message.match(videoTimePattern);

		return rawVideoTime;
	}
	
	static createFromChatMessage(message, chatTime) {

		let lowerCaseMessage = message.toLowerCase();
		if(lowerCaseMessage.substr(0, ("now playing:").length) === "now playing:") {
			console.log(message);

			let rawVideoTime = this.getRawVideoTimeFromMessage(message);
			if(rawVideoTime) {
				let videoTime = (rawVideoTime[0].replace(/[\[\]]/g, "")).split(" / ");
				if(videoTime.length === 2) {
					console.log(videoTime);
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
