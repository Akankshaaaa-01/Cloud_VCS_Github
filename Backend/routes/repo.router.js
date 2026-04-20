const express = require('express')
const repoController = require("../controllers/repoController");
const { authenticateMiddleware } = require("../middleware/authenticateMiddleware");

const authorizeMiddleware = require("../middleware/authorizeMiddleware");

const repoRouter=express.Router()

// Ye PUBLIC hai — koi bhi dekh sakta hai
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);

// Sirf logged-in user kar sakta hai — authenticate only
repoRouter.post("/repo/create", authenticateMiddleware, repoController.createRepository);

// Logged in + owner hona chahiye — authenticate + authorize dono
repoRouter.put("/repo/update/:id", authenticateMiddleware, authorizeMiddleware, repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", authenticateMiddleware, authorizeMiddleware, repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", authenticateMiddleware, authorizeMiddleware, repoController.toggleVisibilityById);

module.exports = repoRouter;
module.exports= repoRouter;