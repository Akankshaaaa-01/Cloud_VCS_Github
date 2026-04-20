const express = require("express");
const { getCommitsByRepo } = require("../controllers/commitController");

const commitRouter = express.Router();

// Public — koi bhi repo ke commits dekh sakta hai
commitRouter.get("/commits/:repoId", getCommitsByRepo);

module.exports = commitRouter;