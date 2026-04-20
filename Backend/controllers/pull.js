const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {

  const currentDir = process.cwd();
  const repoPath = path.join(currentDir, ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    // config se userId aur repoName lo
    const config = JSON.parse(
      await fs.readFile(path.join(repoPath, "config.json"), "utf-8")
    );
    const { userId, repoName } = config;
    // Pehle: "commits/" → sab kuch aata tha
    // Ab: "userId/repoName/commits/" → sirf apna data

     const prefix = `${userId}/${repoName}/commits/`;
    //  S3 se list of objects lo
    const data = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix:  prefix
    }).promise();


    const objects = data.Contents;  //[
                                    //   { Key: "commits/abc123/file.txt" },
                                    //   { Key: "commits/abc123/commit.json" },
                                    //   { Key: "commits/xyz789/app.js" }
                                    // ]

    if (!objects || objects.length === 0) {
      console.log("No files found in S3, Nothing to pull");
      return;
    }

    //  har object download karo
    for (const obj of objects) {
      const key = obj.Key; 
      // key = "userId/repoName/commits/commitId/file.txt"

      const parts = key.split("/");
      // parts[0]=userId, parts[1]=repoName, parts[2]=commits
      // parts[3]=commitId, parts[4]=fileName
      const commitId = parts[3];
      const fileName = parts[4];

       if (!fileName) continue;

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