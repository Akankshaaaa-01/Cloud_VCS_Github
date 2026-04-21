// controllers/fileController.js
const { s3, S3_BUCKET } = require("../config/aws-config");
const Commit = require("../models/commitModel");
const Repository = require("../models/repoModel");

// GET /repo/:id/files — latest commit ki files list
const getRepoFiles = async (req, res) => {
  try {
    const { id } = req.params;

    const repo = await Repository.findById(id).populate("owner");
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    // Latest commit dhundo
    const latestCommit = await Commit.findOne({ repository: id })
      .sort({ createdAt: -1 });

    if (!latestCommit) {
      return res.status(200).json({ files: [] });
    }

    // S3 se us commit ki files list karo
    const prefix = latestCommit.s3Prefix ;
    const data = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    }).promise();

    console.log("Prefix:", prefix);
    console.log("S3 Data:", data.Contents);

    const files = (data.Contents || [])
      .map(obj => obj.Key)
      .filter(key => !key.endsWith("commit.json")) // metadata skip
      .map(key => ({
        name: key.split("/").pop(),
        s3Key: key,
      }));

    res.status(200).json({ files, commitId: latestCommit._id, message: latestCommit.message });

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