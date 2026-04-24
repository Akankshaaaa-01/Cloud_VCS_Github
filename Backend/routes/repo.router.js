const express = require('express');
const repoController = require("../controllers/repoController");
const { getRepoFiles, getFileContent } = require("../controllers/fileController");
const { authenticateMiddleware } = require("../middleware/authenticateMiddleware");
const authorizeMiddleware = require("../middleware/authorizeMiddleware");

const repoRouter = express.Router();

// ── PUBLIC ROUTES ──

// Specific pehle — inhe :id se match nahi hona chahiye
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);

// Generic baad mein — :id sabse last mein
repoRouter.get("/repo/:id/files", getRepoFiles);
repoRouter.get("/repo/:id/file", getFileContent);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById); // ← LAST

// ── PROTECTED ROUTES ──
repoRouter.post("/repo/create", authenticateMiddleware, repoController.createRepository);
repoRouter.put("/repo/update/:id", authenticateMiddleware, authorizeMiddleware, repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", authenticateMiddleware, authorizeMiddleware, repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", authenticateMiddleware, authorizeMiddleware, repoController.toggleVisibilityById);

module.exports = repoRouter;