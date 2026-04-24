const fs = require("fs").promises;
const path = require("path");

// Folder + file dono handle karta hai
// add.js aur commit.js mein bhi same function hai
async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    // Folder hai — dest mein bhi folder banao
    await fs.mkdir(dest, { recursive: true });
    const files = await fs.readdir(src);

    for (const file of files) {
      await copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    }
  } else {
    // File hai — parent folder bana ke copy karo
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
  }
}

async function revertRepo(commitId) {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");
  const commitDir = path.join(commitsPath, commitId);

  try {
    // Check: commit exist karta hai ya nahi
    await fs.access(commitDir);

    // Commit ke andar files read karo
    const files = await fs.readdir(commitDir);

    if (files.length === 0) {
      console.log("No files in this commit");
      process.exit(1);
    }

    // Har file/folder ko working directory mein copy karo
    for (const file of files) {

      // Metadata skip karo
      if (file === "commit.json") continue;

      const src = path.join(commitDir, file);
      const dest = path.join(currentDir, file);

      // copyRecursive — folder bhi handle hoga
      await copyRecursive(src, dest);
    }

    console.log(`Reverted to commit: ${commitId}`);
    process.exit(0);

  } catch (err) {
    console.error("Error reverting:", err.message);
    process.exit(1);
  }
}

module.exports = { revertRepo };