const fs = require("fs").promises;
const path = require("path");

// 🔥 recursive copy (folder + file support)
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

async function addRepo(filePath) {
  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });

    // absolute path bana lo (safe)
    const fullPath = path.join(currentDir, filePath);

    // relative path preserve karo
    const relativePath = path.relative(currentDir, fullPath);
    const destPath = path.join(stagingPath, relativePath);

    // 🔥 main fix
    await copyRecursive(fullPath, destPath);

    console.log(`"${filePath}" added to staging area`);

  } catch (err) {
    console.error("Error adding file: ", err);
  }
}

module.exports = { addRepo };