const express = require("express");
const router = express.Router();
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT");

const config = require(process.cwd() + "/config");
router.use(verifyJWT);

router.get("/", (req, res) => {
	return res.json({ result: true, user: req.user });
});

router.get("/vote/:voteOption", (req, res) => {
	return req.user.vote(req.params.voteOption).then(() => {
		res.json({ result: true });
	})
	.catch(err => {
		console.log(err);
		res.json(err);
	})
});

router.get("/revoke", (req, res) => {
	return req.user.revokeAccess(res).then((result => {
		res.redirect(config.siteURL+"?revoked=1");
	}))
	.catch(err => {
		res.redirect(config.siteURL+"?error=2");
	})
});

module.exports = router;
