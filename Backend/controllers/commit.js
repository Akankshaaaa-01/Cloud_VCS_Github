const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto"); // hash generate karne ke liye

// 🔥 ADD THIS (new helper — folder support)
async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });

    const files = await fs.readdir(src);

    for (const file of files) {
      await copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    }
  } else {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
  }
}

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

      // 🔥 CHANGE ONLY THIS LINE
      await copyRecursive(src, dest);
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
      await fs.rm(path.join(stagingPath, file), { recursive: true, force: true }); // 🔥 small fix (folder support)
    }

    console.log(`Commit ID: ${commitId} created for your commit with message: ${message}`);

  } catch (err) {
    console.error("Error committing files:", err.message);
  }
}

module.exports = { commitRepo };