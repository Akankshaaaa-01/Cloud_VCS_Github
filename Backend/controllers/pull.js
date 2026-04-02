const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    //  S3 se list of objects lo
    const data = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: "commits/"
    }).promise();

    const objects = data.Contents;  //[
                                    //   { Key: "commits/abc123/file.txt" },
                                    //   { Key: "commits/abc123/commit.json" },
                                    //   { Key: "commits/xyz789/app.js" }
                                    // ]

    if (!objects || objects.length === 0) {
      console.log("No files found in S3");
      return;
    }

    //  har object download karo
    for (const obj of objects) {
      const key = obj.Key; 
      // Example: commits/abc123/file.txt

      const parts = key.split("/");

      const commitId = parts[1];
      const fileName = parts[2];

      //  local commit folder
      const commitDir = path.join(commitsPath, commitId);
      await fs.mkdir(commitDir, { recursive: true });

      // file download karo
      const fileData = await s3.getObject({
        Bucket: S3_BUCKET,
        Key: key
      }).promise();

      //  local me save karo
      await fs.writeFile(
        path.join(commitDir, fileName),
        fileData.Body //actual file ka content in binary fom
      );

      console.log(`All commits pulled from S3: ${commitId}/${fileName}`);
    }

    console.log("Pull completed successfully!");

  } catch (err) {
    console.error("Error pulling from S3:", err.message);
  }
}

module.exports = { pullRepo };