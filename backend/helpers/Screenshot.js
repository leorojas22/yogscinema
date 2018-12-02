const config = require(process.cwd() + "/config");

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const jimp = require("jimp");

/**
 * 470px down
 *
 * Segment 1: 320x95
 * Segment 2: 320x95
 * Segment 3: 315x95
 * Segment 4: 325x95
 */

const imageProcessing = config.imageProcessing;

// The amount of pixels down on the screenshot to start cropping the votes
// During Jingle Jam: 433
// Normal: 470
const CROP_Y = 470;
const CROP_Y_JINGLE_JAM = 433;

// The extra time at the end of videos to vote even though the video is over
const EXTRA_TIME = config.voting.additionalVoteTime;

class Screenshot {

	static getCropY() {
		let date = new Date();
		if(date.getMonth() === 11) {
			return CROP_Y_JINGLE_JAM;
		}

		return CROP_Y;
	}
	
	static getImageSizes() {
		let date = new Date();
		if(date.getMonth() === 11) {
			return [
				{ w: 295, h: 86 },
				{ w: 289, h: 86 },
				{ w: 289, h: 86 },
				{ w: 295, h: 86 }
			];
		}
		
		return  [
			{ w: 320, h: 95 },
			{ w: 320, h: 95 },
			{ w: 315, h: 95 },
			{ w: 325, h: 95 }
		];
	}

    static capture() {

        // Available stream resolutions:  1080p60, 160p, 360p, 480p, 720p60
        const saveVideoCommand = imageProcessing.livestreamer +
                                " --player-continuous-http --player-no-close " + imageProcessing.streamURL + " 720p60" +
                                " --twitch-oauth-token " + imageProcessing.oauthToken + " -O | " + imageProcessing.ffmpeg +
                                " -y -t 1 -i - -strict -2 " + imageProcessing.savePath + "screenshot.mp4";

        const saveScreenshotCommand = imageProcessing.ffmpeg + " -y -ss 00:00:00 -i " + imageProcessing.savePath + "screenshot.mp4 -vframes 1 -q:v 2 " +
                                    imageProcessing.savePath + "screenshot.jpg";

        return exec(saveVideoCommand).then((output, err) => {
            if(err) {
                console.log("ERR");
                console.log(err);
                return Promise.reject("Unable to save screenshot video.");
            }

            return exec(saveScreenshotCommand);
        })
        .then((output, err) => {
            if(err) {
                return Promise.reject("Unable to save screenshot image.");
            }

            return Promise.resolve();
        })
        .catch(err => {
            console.log(err);
        });
    }

    static crop() {
        /**
         * 470px down
         *
         * Segment 1: 320x95
         * Segment 2: 320x95
         * Segment 3: 315x95
         * Segment 4: 325x95
         */

        return jimp.read(imageProcessing.savePath + "screenshot.jpg").then(image => {
            let promises = [];
            const imageSizes = Screenshot.getImageSizes();

            let x = 0;
            for(let i = 0; i < imageSizes.length; i++) {
                let imageSize = imageSizes[i];
                let cropImage = image.clone();
                promises.push(cropImage.crop(x, Screenshot.getCropY(), imageSize.w, imageSize.h).write(imageProcessing.publicSavePath + "crop" + i + "." + cropImage.getExtension()));
                x += imageSize.w;
            }

            return Promise.all(promises);
        })
        .then(result => {
            return Promise.resolve();
        })
        .catch(err => {
            console.log("image save error");
            console.log(err);
        });

    }

    static screenshotVotes() {
        config.imageProcessing.screenshotStarted = true;

        this.capture().then(() => {
            return this.crop();
        })
        .then(() => {
            config.imageProcessing.screenshotSaved = Date.now();
            config.imageProcessing.screenshotStarted = false;
        })
        .catch(err => {
            // error
            console.log(err);
        });
    }

    static monitor() {
        // Only continue if we know whats playing, the time remaining is low enough that the votes should have shown up and we haven't already started taking a screenshot
        if(config.chatMonitor.nowPlaying && config.chatMonitor.nowPlaying.timeRemaining <= imageProcessing.startTime && config.chatMonitor.nowPlaying.timeRemaining > 0 && !config.imageProcessing.screenshotStarted) {
            let lastScreenshot = config.imageProcessing.screenshotSaved;

            // If there hasn't been a screenshot, take one, OR
            // If there is a last screenshot, only take a new one if its 5 seconds later
            if(!lastScreenshot || (lastScreenshot && (Date.now() - lastScreenshot) >= 5000)) {
                this.screenshotVotes();
            }

        }
        else if(!config.chatMonitor.nowPlaying || (config.chatMonitor.nowPlaying && config.chatMonitor.nowPlaying.timeRemaining === 0)) {
            if(config.imageProcessing.screenshotSaved) {
                config.imageProcessing.screenshotStarted = true;

                // Wait to erase the vote screenshots
                setTimeout(() => {
                    config.imageProcessing.screenshotSaved = false;
                    config.imageProcessing.screenshotStarted = false;
                }, EXTRA_TIME);

            }
            else {
                config.imageProcessing.screenshotStarted = false;
            }
        }
    }

}

module.exports = Screenshot;
