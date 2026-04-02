const Repository = require("../models/repoModel");

// Ye middleware check karta hai:
// "Jo user logged in hai, kya WO is repo ka owner hai?"
// authenticateMiddleware ke BAAD lagega — kyunki pehle req.user chahiye

const authorizeMiddleware = async (req, res, next) => {
  try {
    // req.user humne authenticateMiddleware mein set kiya tha
    const loggedInUserId = req.user;

    // URL se repo ID lo — jaise /repo/delete/:id
    const repoId = req.params.id;

    // Database mein repo dhundo
    const repo = await Repository.findById(repoId);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // repo.owner ek ObjectId hai — userId ek string hai
    // .toString() se dono same type ke ho jaate hain compare ke liye
    if (repo.owner.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({ 
        message: "Access denied. You are not the owner of this repository." 
      });
    }

    // Owner hai — aage jaane do
    next();

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = authorizeMiddleware;