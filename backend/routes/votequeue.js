const express    = require("express");
const router     = express.Router();
const verifyJWT  = require(process.cwd() + "/middleware/verifyJWT");
const VoteQueue  = require(process.cwd() + "/models/VoteQueue");

router.use(verifyJWT);

router.get("/", (req, res) => {
    VoteQueue.getForUser(req.user).then(votes => {
        res.json({
            result: true,
            data: votes
        });
    })
    .catch(err => {
        res.json({ result: true, data: [] });
    });
});

router.post("/", (req, res) => {
    VoteQueue.createFromSearch({ searchTerm: req.body.searchTerm, user: req.user }).then(vote => {

        if(Array.isArray(vote)) {
            vote = vote[0];
        }

        res.json({
            result: true,
            data: vote
        });
    })
    .catch(err => {
        res.json(err);
    })
});

router.delete("/:id", (req, res) => {
    VoteQueue.find({ user_id: req.user.id, id: req.params.id }).then(voteQueue => {
        return voteQueue.delete();
    })
    .then(() => {
        res.json({ result: true });
    })
    .catch(err => {
        res.json({
            result: false,
            message: "Unable to delete vote from the queue at this time.  Please try again later."
        })
    });
});

router.post("/empty", (req, res) => {
    VoteQueue.deleteForUser(req.user).then(() => {
        res.json({ result: true });
    })
    .catch(err => {
        res.json({
            result: false,
            message: "Unable to empty your queue at this time.  Please try again later."
        })
    });
});


module.exports = router;
