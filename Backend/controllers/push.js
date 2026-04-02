const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config"); // AWS config file

async function pushRepo() {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {

    //saare commits read karo
    const commits = await fs.readdir(commitsPath);

    if (commits.length === 0) {
      console.log("No commits to push");
      return;
    }

    // har commit folder ke liye -> folder level 
    for (const commitId of commits) {
    const commitDir = path.join(commitsPath, commitId);

    // commit ke andar files read karo
    const files = await fs.readdir(commitDir);

      for (const file of files) {  //files in each folder
        const filePath = path.join(commitDir, file);
        // file content read karo
        const fileContent = await fs.readFile(filePath);

        // S3 upload
        await s3.upload({
          Bucket: S3_BUCKET,
          Key: `commits/${commitId}/${file}`, // S3 path
          Body: fileContent
        }).promise();

        console.log(`Uploaded: ${commitId}/${file}`);
      }
    }

    console.log("All commits pushed to S3 successfully!");

  } catch (err) {
    console.error("Error pushing to S3:", err.message);
  }
}

module.exports = { pushRepo };