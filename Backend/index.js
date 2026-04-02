const express= require ("express");
const dotenv=require("dotenv");
const cors=require("cors");
const mongoose=require("mongoose");
const bodyParser= require("body-parser");
const http= require("http");
const {Server}= require("socket.io");
const mainRouter=require("./routes/main.router")

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

// import controllers
const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config();
// CLI setup
yargs(hideBin(process.argv))

.command("start","Starts a new Server",{},startServer)
// INIT
.command(
  "init",
  "Initialize a new repository",
  {},
  initRepo
)

// ADD
.command(
  "add <file>",
  "Add a file to staging area",
  (yargs) => {
    yargs.positional("file", {
      describe: "File to add",
      type: "string",
    });
  },
  (argv)=>{
    addRepo(argv.file);
  }
  
)

// COMMIT
.command(
  "commit <message>",
  "Commit staged changes",
  (yargs) => {
    yargs.positional("message", {
      describe: "Commit message",
      type: "string",
    });
  },
   (argv)=>{
    commitRepo(argv.message);
  }
)

// PUSH
.command(
  "push",
  "Push commits to S3",
  {},
  pushRepo
)

// PULL
.command(
  "pull",
  "Pull latest changes from S3",
  {},
  pullRepo
)

// REVERT
.command(
  "revert <commitID>",
  "Revert to a specific commit",
  (yargs) => {
    yargs.positional("commitID", {
      describe: "Commit ID to revert",
      type: "string",
    });
  },
  (argv)=>{
    revertRepo(argv.commitID);
  }
)

.demandCommand(1, "You need at least one command")
.help()
.argv;

async function startServer(){
    const app=express();
    const port=process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURL=process.env.MONGO_URL
    mongoose.connect(mongoURL).then(() => {
        console.log("DB connected");
    })
    .catch((err) => {
        console.error("Connection failed:", err.message);
    });

    app.use(cors({origin:"*"}));

    app.use("/",mainRouter);

    let user="test";

    const httpServer =http.createServer(app);
    const io =new Server(httpServer,{
        cors: {
            origin: '*',
            methods:["GET","POST"],
        },
    });

    io.on("connection",(socket)=>{
        socket.on("joinRoom",(userID)=>{
            user=userID;
            console.log("===");
            console.log(user);
            console.log("===");
            socket.join(userID);           
            
        })
    })


    const db=mongoose.connection;

    db.once("open",async()=>{
        console.log("CRUD opeations called");
        //CRUD opns
    });

    httpServer.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
        
    })
}