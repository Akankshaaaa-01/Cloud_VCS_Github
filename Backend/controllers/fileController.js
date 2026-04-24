// controllers/fileController.js
const { s3, S3_BUCKET } = require("../config/aws-config");
const Commit = require("../models/commitModel");
const Repository = require("../models/repoModel");

// GET /repo/:id/files — saare commits ki merged files list
const getRepoFiles = async (req, res) => {
  try {
    const { id } = req.params;

    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    // Saare commits lo — latest pehle
    const allCommits = await Commit.find({ repository: id })
      .sort({ createdAt: -1 });

    if (allCommits.length === 0) {
      return res.status(200).json({ files: [] });
    }

    // Map use karo — same naam ki file ka latest version rakho
    // agar file1.js commit1 aur commit2 dono mein hai
    // toh latest wala rakho, purana overwrite ho jaayega
    const fileMap = new Map();

    // Reverse order — purane pehle, naye baad mein
    // Taaki naya version overwrite kare purane ko
    const commitsOldFirst = [...allCommits].reverse();

    for (const commit of commitsOldFirst) {
      if (!commit.s3Prefix) continue;

      const prefix = commit.s3Prefix + "/";

      const data = await s3.listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: prefix,
      }).promise();

      const files = (data.Contents || [])
        .map(obj => obj.Key)
        .filter(key => !key.endsWith("commit.json"))
        .map(key => ({
          name: key.split("/").pop(),
          path: key.slice(prefix.length).replace(/\\/g, "/"),
          s3Key: key,
        }));

      // fileMap mein daalo — same path ka latest version rahega
      for (const file of files) {
        fileMap.set(file.path, file);
      }
    }

    res.status(200).json({
      files: Array.from(fileMap.values()),
      totalCommits: allCommits.length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /repo/:id/file?key=userId/repoName/commits/abc/file.js
const getFileContent = async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ message: "S3 key required" });

    const data = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: key,
    }).promise();

    const content = data.Body.toString("utf-8");
    res.status(200).json({ content });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRepoFiles, getFileContent };