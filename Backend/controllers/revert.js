const fs = require("fs").promises;
const path = require("path");
const {promisify}= require("util");

async function revertRepo(commitId) {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");
  const commitDir = path.join(commitsPath, commitId);

  try {
    //  check: commit exist karta hai ya nahi
    await fs.access(commitDir);

    // commit ke andar files read karo
    const files = await fs.readdir(commitDir);

    if (files.length === 0) {
      console.log("No files in this commit");
      return;
    }

    // har file ko working directory me copy karo
    for (const file of files) {

      // skip metadata file
      if (file === "commit.json") continue;

      const src = path.join(commitDir, file);
      const dest = path.join(currentDir, file);

      await fs.copyFile(src, dest);
    }

    console.log(`Reverted to commit: ${commitId}`);

  } catch (err) {
    console.error("Error reverting:", err.message);
    
  }
}

module.exports = { revertRepo };