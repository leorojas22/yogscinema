const express    = require("express");
const router     = express.Router();
const verifyJWT  = require(process.cwd() + "/middleware/verifyJWT");
const VoteQueue  = require(process.cwd() + "/models/VoteQueue");

router.use(verifyJWT);

router.get("/", (req, res) => {
    VoteQueue.findMany({ user_id: req.user.id, deleted: null }, "id DESC").then(votes => {
        res.json({
            result: true,
            data: votes
        });
    })
    .catch(err => {
        res.json({ result: true, data: [] });
    })
});

router.post("/", (req, res) => {
    VoteQueue.createFromSearch(req.body.searchTerm).then(vote => {
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

module.exports = router;
