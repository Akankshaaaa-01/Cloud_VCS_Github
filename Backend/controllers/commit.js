const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto"); // hash generate karne ke liye

async function commitRepo(message) {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const stagingPath = path.join(repoPath, "staging");
  const commitsPath = path.join(repoPath, "commits");

  try {

    const files = await fs.readdir(stagingPath);

    if (files.length === 0) {
      console.log("Nothing to commit. Use add first.");
      return;
    }
    
    const commitId = crypto.randomBytes(20).toString("hex");
   
    //new commit folder
    const commitDir = path.join(commitsPath, commitId);
    await fs.mkdir(commitDir, { recursive: true });


    // har file ko staging se commit folder me copy karo
    for (const file of files) {
      const src = path.join(stagingPath, file);
      const dest = path.join(commitDir, file);

      await fs.copyFile(src, dest);
    }

    const metadata = {
      message,
      date: new Date().toISOString(),
      files
    };

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify(metadata)
    );

     // Staging clear karo — warna agle commit mein bhi aayengi purani files
    for (const file of files) {
      await fs.unlink(path.join(stagingPath, file));
    }

    console.log(`Commit ID: ${commitId} created for your commit with message: ${message}`);

  } catch (err) {
    console.error("Error committing files:", err.message);
  }
}

module.exports = { commitRepo };