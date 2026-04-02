// User A stars Repo X
//     ↓
// 2 jagah update hoga simultaneously:
// 1. User A ke starRepos array mein → Repo X ki id push hogi
// 2. Repo X ke stars count mein → +1 hoga

const User = require("../models/userModel");
const Repository = require("../models/repoModel");

const toggleStar = async (req, res) => {
  try {
    // req.user — authenticate middleware ne set kiya
    // req.params.repoId — URL se aaya, kaun si repo star karni hai
    const userId = req.user;
    const { repoId } = req.params;

    // Step 1: Repo exist karti hai?
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Step 2: User exist karta hai?
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 3: Check karo — kya user ne already star kiya hua hai?
    // user.starRepos ek array hai ObjectIds ka
    // .toString() isliye kyunki ObjectId aur String directly compare nahi hote
    const alreadyStarred = user.starRepos.some(  //Array ke har element pe ye condition check karo — koi ek bhi true ho jaaye toh true return karo"
      (id) => id.toString() === repoId.toString()
    );

    //aise bhi kr skte the -> let alreadyStarred = false;

// for (let i = 0; i < user.starRepos.length; i++) {
//   if (user.starRepos[i].toString() === repoId.toString()) {
//     alreadyStarred = true;
//     break;
//   }
// }

    if (alreadyStarred) {
      // ── UNSTAR ──
      // User ke starRepos se repo id nikalo
      await User.findByIdAndUpdate(
        userId,
        { $pull: { starRepos: repoId } }
      );

      // Repo ki star count ghata do — $inc se -1
      await Repository.findByIdAndUpdate(
        repoId,
        { $inc: { stars: -1 } }  //**"$inc vs manually +1 karna"** — $incatomic hai — matlab agar 2 users simultaneously star karein toh race condition nahi hogi. Manualstars + 1` unsafe hota hai.
      );

      return res.status(200).json({ message: "Repository unstarred successfully" });

    } else {
      // ── STAR ──
      // User ke starRepos mein repo id daalo
      await User.findByIdAndUpdate(
        userId,
        { $push: { starRepos: repoId } }
      );

      // Repo ki star count badhao — $inc se +1
      await Repository.findByIdAndUpdate(
        repoId,
        { $inc: { stars: 1 } }
      );

      return res.status(200).json({ message: "Repository starred successfully" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ek repo ke saare stars count aur starred users dekhne ke liye
const getStargazers = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Jinke starRepos array mein ye repoId hai — woh saare users
    const stargazers = await User.find(
      { starRepos: repoId }  // MongoDB array mein value dhundta hai
    ).select("-password");   // password mat bhejo

    res.status(200).json({
      stars: repo.stars,
      stargazers
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { toggleStar, getStargazers };
