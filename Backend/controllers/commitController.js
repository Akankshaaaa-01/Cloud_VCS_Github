const Commit = require("../models/commitModel");

// Ek repo ke saare commits fetch karo
const getCommitsByRepo = async (req, res) => {
  try {
    const { repoId } = req.params;

    const commits = await Commit.find({ repository: repoId })
      .populate("user", "username avatar") // user ka naam dikhao
      .sort({ createdAt: -1 }); // latest pehle

    if (!commits || commits.length === 0) {
      return res.status(404).json({ message: "No commits found" });
    }

    res.status(200).json(commits);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCommitsByRepo };