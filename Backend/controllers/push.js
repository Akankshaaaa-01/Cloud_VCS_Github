const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");
const Commit = require("../models/commitModel");
const Repository = require("../models/repoModel");
const mongoose = require("mongoose");
require("dotenv").config();

// Recurisve file read karne ke liye function
async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(entries.map(entry => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(res) : res;
  }));

  return files.flat();
}

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

    // pushed commits track karne ke liye
    if (!config.pushedCommits) {
      config.pushedCommits = [];
    }

    if (!userId || !repoName) {
      console.log("Config missing. Run init again.");
      return;
    }

    const commits = (await fs.readdir(commitsPath)).sort();

    if (commits.length === 0) {
      console.log("No commits to push");
      return;
    }

    await mongoose.connect(process.env.MONGO_URL);

    const repo = await Repository.findOne({
      name: repoName,
      owner: userId
    });

    if (!repo) {
      console.log(`Repo "${repoName}" not found`);
      return;
    }

    for (const commitId of commits) {

      if (config.pushedCommits.includes(commitId)) {
        console.log(`Skipping ${commitId}`);
        continue;
      }

      const commitDir = path.join(commitsPath, commitId);

      const metadataPath = path.join(commitDir, "commit.json");
      try {
        await fs.access(metadataPath);
      } catch {
        console.log(`Skipping invalid commit: ${commitId}`);
        continue;
      }

      // ✅ FIX: only commit folder files
      const files = await getAllFiles(commitDir);

      const filesChanged = [];

      for (const filePath of files) {

        if (filePath.endsWith("commit.json")) continue;

        // relative path from commitDir
        const relativePath = path.relative(commitDir, filePath);

        const normalizedFile = relativePath.replace(/\\/g, "/");

        const fileContent = await fs.readFile(filePath);

        const s3Key = `${userId}/${repoName}/commits/${commitId}/${normalizedFile}`;

        await s3.upload({
          Bucket: S3_BUCKET,
          Key: s3Key,
          Body: fileContent
        }).promise();

        filesChanged.push(normalizedFile);
        console.log(`Uploaded: ${s3Key}`);
      }

      const metadata = JSON.parse(
        await fs.readFile(metadataPath, "utf-8")
      );

      await Commit.create({
        message: metadata.message,
        repository: repo._id,
        user: new mongoose.Types.ObjectId(userId),
        filesChanged,
        s3Prefix: `${userId}/${repoName}/commits/${commitId}`
      });

      console.log("Commit saved to DB");

      config.pushedCommits.push(commitId);
    }

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(config, null, 2)
    );

    console.log("Push complete");

  } catch (err) {
    console.error("Error:", err.message);
  }
}

module.exports = { pushRepo };