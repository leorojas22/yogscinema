const express = require("express");
const router = express.Router();
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT");

router.use(verifyJWT);

router.get("/", (req, res) => {
	return res.json({ result: true, user: req.user });
});

router.get("/vote/:voteOption", (req, res) => {
	req.user.vote(req.params.voteOption).then(() => {
		res.json({ result: true });
	})
	.catch(err => {
		console.log(err);
		res.json(err);
	})
});

module.exports = router;
