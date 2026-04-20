// starRouter.js
const express = require("express");
const { toggleStar, getStargazers } = require("../controllers/starController");
const { authenticateMiddleware } = require("../middleware/authenticateMiddleware");

const starRouter = express.Router();

// Star/Unstar — logged in hona chahiye
starRouter.patch("/star/:repoId", authenticateMiddleware, toggleStar);

// Stargazers — public
starRouter.get("/star/:repoId/stargazers", getStargazers);

module.exports = starRouter;