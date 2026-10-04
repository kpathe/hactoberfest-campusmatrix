import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notification.js";

export const getDirectory = async (req, res) => {
  try {
    const { department, role, search } = req.query;

    let userFilter = {};
    if (role) userFilter.roles = role;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      userFilter.$or = [{ name: searchRegex }, { username: searchRegex }];
    }

    const matchedUsers = await User.find(userFilter).select("_id");
    const userIds = matchedUsers.map((u) => u._id);

    let profileFilter = { user: { $in: userIds } };
    if (department) {
      profileFilter.department = new RegExp(department, "i");
    }

    const directory = await Profile.find(profileFilter)
      .populate("user", "name username email year roles")
      .sort({ totalDynamicScore: -1 });

    return res.status(200).json(directory);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching directory", error: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    let myProfile = await Profile.findOne({ user: req.user._id });
    let targetProfile = await Profile.findOne({ user: targetUserId });

    if (!myProfile) {
      myProfile = await Profile.create({ user: req.user._id });
    }
    if (!targetProfile) {
      targetProfile = await Profile.create({ user: targetUserId });
    }

    if (!myProfile.following.includes(targetUserId)) {
      myProfile.following.push(targetUserId);
      await myProfile.save();
    }

    if (!targetProfile.followers.includes(req.user._id)) {
      targetProfile.followers.push(req.user._id);
      await targetProfile.save();

      await createNotification({
        user: targetUserId,
        type: "follow",
        title: "New Follower",
        body: `${req.user.name} started following you.`,
        link: `/profile/${req.user.username}`,
      });
    }

    return res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    return res.status(500).json({ message: "Error following user", error: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;

    const myProfile = await Profile.findOne({ user: req.user._id });
    const targetProfile = await Profile.findOne({ user: targetUserId });

    if (myProfile) {
      myProfile.following = myProfile.following.filter(
        (id) => id.toString() !== targetUserId
      );
      await myProfile.save();
    }

    if (targetProfile) {
      targetProfile.followers = targetProfile.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      await targetProfile.save();
    }

    return res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    return res.status(500).json({ message: "Error unfollowing user", error: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ user: userId }).populate(
      "followers",
      "name username email year roles"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile.followers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching followers", error: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ user: userId }).populate(
      "following",
      "name username email year roles"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile.following);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching following", error: error.message });
  }
};
