const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/userModel");
require("dotenv").config();

async function initRepo(username, repoName) {
  const currentDir = process.cwd();
  const repoPath = path.resolve(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");
  
  try {
    // DB connect karo — user dhundne ke liye
    await mongoose.connect(process.env.MONGO_URL);

    // Username se user dhundo
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`User "${username}" not found. Please signup first.`);
      return;
    }

    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    

    // Config mein userId internally save karo
    // User ko sirf username dena tha 
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({
        bucket: process.env.S3_BUCKET,
        userId: user._id.toString(),  // internally ID use hogi
        username: username,           // reference ke liye
        repoName
      }, null, 2) //JSON.stringify(value, replacer, space)
    );

    console.log(`Repository "${repoName}" initialized for user "${username}"!`);

  } catch (err) {
    console.error("Error initializing:", err.message);
  }
}

module.exports = { initRepo };