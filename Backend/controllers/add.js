const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const stagingPath = path.join(repoPath, "staging");
//   const filePath = path.join(currentDir, fileName);

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName= path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagingPath,fileName))
    console.log(`File "${fileName}" added to staging area`);

  } 
  catch (err) {
   console.error("Error adding file: ",err);
  }
}

module.exports = { addRepo };