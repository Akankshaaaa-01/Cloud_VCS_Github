const express = require('express')
const mainRouter=express.Router()
const userRouter=require("./user.router")
const repoRouter=require("./repo.router")

const issueRouter=require("./issue.router")
const starRouter = require("./starRouter");
const followRouter = require("./followRouter");
const commitRouter = require("./commit.router"); 

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(starRouter);
mainRouter.use(followRouter);
mainRouter.use(commitRouter);

mainRouter.get("/", (req, res) => {
    res.send("Server is running...");
    });

module.exports=mainRouter;