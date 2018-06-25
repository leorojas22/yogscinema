const express = require("express");
const router = express.Router();
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT");
const CustomVote = require(process.cwd() + "/models/CustomVote");

router.use(verifyJWT);

router.get("/", (req, res) => {
	CustomVote.findRecent({}, true).then(recentVotes => {
		res.json({
			result: true,
			data: recentVotes
		})
	})
	.catch(err => {
		res.json({ result: true, data: [] });
	});
});


module.exports = router;
