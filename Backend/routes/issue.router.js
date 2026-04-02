const express = require('express');
const issueController = require("../controllers/issueController");
const authenticateMiddleware = require("../middleware/authenticateMiddleware");

const issueRouter = express.Router();

// PUBLIC
issueRouter.get("/issue/all", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);

//  Logged in hona chahiye
issueRouter.post("/issue/create", authenticateMiddleware, issueController.createIssue);
issueRouter.put("/issue/:id", authenticateMiddleware, issueController.updateIssueById);
issueRouter.delete("/issue/:id", authenticateMiddleware, issueController.deleteIssueById);

module.exports = issueRouter;