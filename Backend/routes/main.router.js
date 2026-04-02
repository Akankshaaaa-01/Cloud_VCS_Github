const express = require('express')
const userRouter=require("./user.router")
const repoRouter=require("./repo.router")
const mainRouter=express.Router()
const issueRouter=require("./issue.router")
const starRouter = require("./starRouter");
const followRouter = require("./followRouter");

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
router.use("/", starRouter);
router.use("/", followRouter);

mainRouter.get("/", (req, res) => {
    res.send("Server is running...");
    });

module.exports=mainRouter;