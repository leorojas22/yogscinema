const express = require("express");
const router = express.Router();
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT");

const config = require(process.cwd() + "/config");
router.use(verifyJWT);

router.get("/", (req, res) => {
    return res.json({ result: true, user: req.user });
});

router.patch("/", (req, res) => {
    return req.user.update({ remove_vote_queue_if_wins: req.body.removeVoteQueueIfWins }).then((user) => {
        return res.json({ result: true, user: req.user });
    })
    .catch((err) => {
        console.log(err);
        res.json({
            result: false,
            message: "Unable to update user.  Please try again later."
        })
    })
});

router.post("/vote", (req, res) => {
    return req.user.vote(req.body.voteOption).then(() => {
        res.json({ result: true });
    })
    .catch(err => {
        console.log(err);
        res.json(err);
    })
});

router.post("/cinema", (req, res) => {
    return req.user.sayCinemaCommand().then(() => {
        res.json({ result: true });
    })
    .catch(err => {
        res.json(err);
    });
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
