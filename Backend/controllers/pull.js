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

    // S3 se list of objects lo
    const data = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: prefix
    }).promise();

    const objects = data.Contents;
    //[
    //   { Key: "userId/repoName/commits/abc123/file.txt" },
    //   { Key: "userId/repoName/commits/abc123/src/App.js" },
    //]

    if (!objects || objects.length === 0) {
      console.log("No files found in S3, Nothing to pull");
      return;
    }

    // har object download karo
    for (const obj of objects) {
      const key = obj.Key;
      // key = "userId/repoName/commits/commitId/src/App.js"

      const parts = key.split("/");
      // parts[0]=userId, parts[1]=repoName, parts[2]=commits
      // parts[3]=commitId, parts[4+]=filePath (nested bhi ho sakta hai)

      const commitId = parts[3];

      // FIX — slice(4) se nested path bhi handle hoga
      const fileParts = parts.slice(4);
      const fileName = fileParts.join("/");
      // "src/components/App.js" — nested path preserve hoga

      if (!fileName) continue;

      // local commit folder
      const commitDir = path.join(commitsPath, commitId);

      // FIX — nested folders bhi bana lo
      const destPath = path.join(commitDir, fileName);
      await fs.mkdir(path.dirname(destPath), { recursive: true });

      // file download karo
      const fileData = await s3.getObject({
        Bucket: S3_BUCKET,
        Key: key
      }).promise();

      // local me save karo
      await fs.writeFile(
        destPath,
        fileData.Body // actual file ka content in binary form
      );

      console.log(`Pulled: ${commitId}/${fileName}`);
    }

    console.log("Pull completed successfully!");

  } catch (err) {
    console.error("Error pulling from S3:", err.message);
  }
}

module.exports = { pullRepo };