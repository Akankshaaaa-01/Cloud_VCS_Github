const express = require("express");
const { getCommitsByRepo } = require("../controllers/commitsController");

const commitRouter = express.Router();

// Public — koi bhi repo ke commits dekh sakta hai
commitRouter.get("/commits/:repoId", getCommitsByRepo);

module.exports = commitRouter;