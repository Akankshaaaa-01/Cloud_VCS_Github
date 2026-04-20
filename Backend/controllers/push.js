const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config"); // AWS config file
const Commit = require("../models/commitModel");
const Repository = require("../models/repoModel");
const mongoose = require("mongoose");
require("dotenv").config();

async function pushRepo() {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {

    // config se userId aur repoName lo
    const config = JSON.parse(
      await fs.readFile(path.join(repoPath, "config.json"), "utf-8")
    );
    const { userId, repoName } = config;

    if (!userId || !repoName) {
      console.log("Config missing. Run init again with userId and repoName.");
      return;
    }

    //saare commits read karo
    const commits = await fs.readdir(commitsPath);

    if (commits.length === 0) {
      console.log("No commits to push");
      return;
    }

    // MongoDB connect karo — commit record save karne ke liye
    await mongoose.connect(process.env.MONGO_URL);

    // Repo dhundho DB mein — ObjectId chahiye
    const repo = await Repository.findOne({ 
      name: repoName, 
      owner: userId 
    });

    if (!repo) {
      console.log(`Repo: "${repoName}" not found in DB.`);
      console.log(`Please create a Repository first!.`);
      return;
    }


    // har commit folder ke liye -> folder level 
    for (const commitId of commits) {
    const commitDir = path.join(commitsPath, commitId);

    // commit ke andar files read karo
    const files = await fs.readdir(commitDir);
    const filesChanged = [];

      for (const file of files) {  //files in each folder
        if (file === "commit.json") continue;
        const filePath = path.join(commitDir, file);
        // file content read karo
        const fileContent = await fs.readFile(filePath);
         // S3 path mein userId aur repoName — multi user support
        const s3Key = `${userId}/${repoName}/commits/${commitId}/${file}`;

        // S3 upload
        await s3.upload({
          Bucket: S3_BUCKET,
          Key: s3Key, // S3 path
          Body: fileContent
        }).promise();

        filesChanged.push(file);
        console.log(`Uploaded: ${s3Key}`);
      }

      // commit metadata bhi read karo
      const metadataContent = await fs.readFile(path.join(commitDir, "commit.json"), "utf-8");
      const metadata = JSON.parse(metadataContent);

      // MongoDB mein commit record save karo
      await Commit.create({
        message: metadata.message,
        repository: repo._id,  // ← ObjectId — schema expect karta hai
        user: userId,           // ← userId string — schema ObjectId expect karta hai
        filesChanged,
        s3Prefix: `${userId}/${repoName}/commits/${commitId}`
      });
      console.log(`Commit saved to DB!`);

    }

    console.log("All commits pushed to S3 successfully!");

  } catch (err) {
    console.error("Error pushing to S3:", err.message);
  }
}

module.exports = { pushRepo };