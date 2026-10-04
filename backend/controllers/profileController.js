import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { sanitizeArrayInput } from "../utils/validation.js";
import { aggregateStats } from "../utils/statAggregator.js";

export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      department,
      bio,
      skills,
      interests,
      languages,
      gender,
      profileImage,
      coverImage,
      linkedin,
      githubUsername,
      leetcodeUsername,
      gfgUsername,
    } = req.body;

    let profile = await Profile.findOne({ user: userId });

    const sanitizedSkills = sanitizeArrayInput(skills);
    const sanitizedInterests = sanitizeArrayInput(interests);
    const sanitizedLanguages = sanitizeArrayInput(languages);

    if (profile) {
      if (department !== undefined) profile.department = department;
      if (bio !== undefined) profile.bio = bio;
      if (skills !== undefined) profile.skills = sanitizedSkills;
      if (interests !== undefined) profile.interests = sanitizedInterests;
      if (languages !== undefined) profile.languages = sanitizedLanguages;
      if (gender !== undefined) profile.gender = gender;
      if (profileImage !== undefined) profile.profileImage = profileImage;
      if (coverImage !== undefined) profile.coverImage = coverImage;
      if (linkedin !== undefined) profile.linkedin = linkedin;
      if (githubUsername !== undefined) profile.githubUsername = githubUsername.trim();
      if (leetcodeUsername !== undefined) profile.leetcodeUsername = leetcodeUsername.trim();
      if (gfgUsername !== undefined) profile.gfgUsername = gfgUsername.trim();

      // Refresh dynamic stats
      const stats = await aggregateStats(profile);
      profile.totalDynamicScore = stats.totalScore;
      profile.combinedStreak = stats.combinedStreak;
      profile.contributionGraph = stats.contributionGraph;
      profile.platformBreakdown = stats.platformBreakdown;

      await profile.save();
    } else {
      profile = new Profile({
        user: userId,
        department: department || "",
        bio: bio || "",
        skills: sanitizedSkills,
        interests: sanitizedInterests,
        languages: sanitizedLanguages,
        gender: gender || "",
        profileImage: profileImage || "",
        coverImage: coverImage || "",
        linkedin: linkedin || "",
        githubUsername: (githubUsername || "").trim(),
        leetcodeUsername: (leetcodeUsername || "").trim(),
        gfgUsername: (gfgUsername || "").trim(),
      });

      const stats = await aggregateStats(profile);
      profile.totalDynamicScore = stats.totalScore;
      profile.combinedStreak = stats.combinedStreak;
      profile.contributionGraph = stats.contributionGraph;
      profile.platformBreakdown = stats.platformBreakdown;

      await profile.save();
      await User.findByIdAndUpdate(userId, { hasProfile: true });
    }

    return res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (error) {
    console.error("createProfile error:", error);
    return res.status(500).json({ message: "Failed to save profile", error: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "-password");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = await Profile.findOne({ user: user._id }).populate("user", "name username email roles year");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this user" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public profile", error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    const searchRegex = q ? new RegExp(q, "i") : null;

    let userQuery = {};
    if (searchRegex) {
      userQuery.$or = [{ name: searchRegex }, { username: searchRegex }, { email: searchRegex }];
    }
    if (role) {
      userQuery.roles = role;
    }

    const users = await User.find(userQuery).select("-password").limit(20);
    const userIds = users.map((u) => u._id);

    const profiles = await Profile.find({ user: { $in: userIds } }).populate("user", "-password");

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ message: "Error searching users", error: error.message });
  }
};

export const refreshStats = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const stats = await aggregateStats(profile);
    profile.totalDynamicScore = stats.totalScore;
    profile.combinedStreak = stats.combinedStreak;
    profile.contributionGraph = stats.contributionGraph;
    profile.platformBreakdown = stats.platformBreakdown;

    await profile.save();

    return res.status(200).json({ message: "Stats refreshed successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: "Failed to refresh stats", error: error.message });
  }
};

export const updateExternalHandles = async (req, res) => {
  try {
    const { githubUsername, leetcodeUsername, gfgUsername } = req.body;
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Create a profile first." });
    }

    if (githubUsername !== undefined) profile.githubUsername = githubUsername.trim();
    if (leetcodeUsername !== undefined) profile.leetcodeUsername = leetcodeUsername.trim();
    if (gfgUsername !== undefined) profile.gfgUsername = gfgUsername.trim();

    const stats = await aggregateStats(profile);
    profile.totalDynamicScore = stats.totalScore;
    profile.combinedStreak = stats.combinedStreak;
    profile.contributionGraph = stats.contributionGraph;
    profile.platformBreakdown = stats.platformBreakdown;

    await profile.save();

    return res.status(200).json({ message: "Handles updated successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update handles", error: error.message });
  }
};
