const fs = require("fs").promises;  // file system of Node (async version , can use await due to promises)
const path = require("path");       // path handling

async function initRepo() {

  
  const currentDir = process.cwd(); // current working directory 
  const repoPath = path.resolve(currentDir, ".apnaGit"); // .apnaGit folder ka full path banaya
  const commitsPath = path.join(repoPath, "commits");  // commits folder ka path (inside .apnaGit)

  try {
    // .apnaGit folder create karo
    // { recursive: true } → agar parent folder na ho to bhi create kare
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.writeFile(path.join(repoPath,"config.json"),
    JSON.stringify({bucket:process.env.S3_BUCKET})
    );

    console.log(" Repository initialized successfully!");
   

  } catch (err) {
    console.error("Error initializing repository:", err.message);
  }
}

// export function (so index.js me use ho sake)
module.exports = { initRepo };