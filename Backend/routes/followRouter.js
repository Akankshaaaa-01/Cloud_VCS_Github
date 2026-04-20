// followRouter.js
const express = require("express");
const { toggleFollow, getFollowData } = require("../controllers/followController");
const { authenticateMiddleware } = require("../middleware/authenticateMiddleware");

const followRouter = express.Router();

// Follow/Unfollow — logged in hona chahiye
followRouter.patch("/follow/:userId", authenticateMiddleware, toggleFollow);

// Follow data — public
followRouter.get("/follow/:userId/data", getFollowData);

module.exports = followRouter;