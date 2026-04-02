// User A follows User B
//     ↓
// Sirf 1 jagah update hoga:
// User A ke followedUsers array mein → User B ki id push hogi
// (User B ko pata bhi nahi chalta — real GitHub mein bhi aise hi hai)

const User = require("../models/userModel");

const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user;           // jo follow kar raha hai
    const { userId: followingId } = req.params; // jise follow karna hai

    // Step 1: Apne aap ko follow karne se rokna
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Step 2: Dono users exist karte hain?
    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);

    if (!follower) return res.status(404).json({ message: "Follower not found" });
    if (!following) return res.status(404).json({ message: "User not found" });

    // Step 3: Already follow kar raha hai?
    const alreadyFollowing = follower.followedUsers.some(
      (id) => id.toString() === followingId.toString()
    );

    if (alreadyFollowing) {
      // ── UNFOLLOW ──
      await User.findByIdAndUpdate(
        followerId,
        { $pull: { followedUsers: followingId } }
      );

      return res.status(200).json({ message: "Unfollowed successfully" });

    } else {
      // ── FOLLOW ──
      await User.findByIdAndUpdate(
        followerId,
        { $push: { followedUsers: followingId } }
      );

      return res.status(200).json({ message: "Followed successfully" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kisi user ke followers aur following dekhna
const getFollowData = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("followedUsers", "-password") // followedUsers ke poore documents
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Followers — jinke followedUsers array mein ye userId hai
    const followers = await User.find(
      { followedUsers: userId }
    ).select("-password");

    res.status(200).json({
      following: user.followedUsers,  // ye user jinhe follow karta hai
      followers: followers,           // ye user ke followers
      followingCount: user.followedUsers.length,
      followerCount: followers.length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { toggleFollow, getFollowData };