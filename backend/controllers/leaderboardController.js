import Profile from "../models/Profile.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Profile.find()
      .populate("user", "name username email year roles")
      .sort({ totalDynamicScore: -1, gamificationPoints: -1 })
      .limit(50);

    const formatted = leaderboard.map((p, index) => ({
      rank: index + 1,
      _id: p._id,
      user: p.user,
      department: p.department,
      profileImage: p.profileImage,
      totalDynamicScore: p.totalDynamicScore || 0,
      gamificationPoints: p.gamificationPoints || 0,
      combinedStreak: p.combinedStreak || 0,
      platformBreakdown: p.platformBreakdown || { github: 0, leetcode: 0, gfg: 0 },
      badges: p.badges || [],
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
};
