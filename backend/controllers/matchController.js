import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { createNotification } from "../utils/notification.js";

export const getPotentialMatches = async (req, res) => {
  try {
    const userRole = req.user.roles.includes("mentor") ? "mentee" : "mentor";
    const myProfile = await Profile.findOne({ user: req.user._id });

    // Existing connections
    const existingConnections = await Connection.find({
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }],
    });

    const connectedUserIds = existingConnections.map((c) =>
      c.mentor.toString() === req.user._id.toString() ? c.mentee.toString() : c.mentor.toString()
    );
    connectedUserIds.push(req.user._id.toString());

    // Find users with opposite role
    const potentialUsers = await User.find({
      _id: { $nin: connectedUserIds },
      roles: userRole,
    }).select("-password");

    const potentialProfiles = await Profile.find({
      user: { $in: potentialUsers.map((u) => u._id) },
    }).populate("user", "name username email year roles");

    const mySkills = myProfile?.skills || [];
    const myInterests = myProfile?.interests || [];

    const matches = potentialProfiles.map((p) => {
      const pSkills = p.skills || [];
      const pInterests = p.interests || [];

      const commonSkills = pSkills.filter((s) => mySkills.includes(s));
      const commonInterests = pInterests.filter((i) => myInterests.includes(i));

      const matchScore = Math.min(
        99,
        Math.max(40, (commonSkills.length * 20) + (commonInterests.length * 15) + 50)
      );

      return {
        ...p.toObject(),
        matchScore,
        sharedSkills: commonSkills,
        sharedInterests: commonInterests,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching potential matches", error: error.message });
  }
};

export const requestConnection = async (req, res) => {
  try {
    const { targetUserId, mentorId, menteeId } = req.body;
    const recipientId = targetUserId || (req.user.roles.includes("mentor") ? menteeId : mentorId);

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient user ID is required" });
    }

    const mentor = req.user.roles.includes("mentor") ? req.user._id : recipientId;
    const mentee = req.user.roles.includes("mentor") ? recipientId : req.user._id;

    const existing = await Connection.findOne({ mentor, mentee });
    if (existing) {
      return res.status(400).json({ message: "Connection request already exists or is established" });
    }

    const connection = await Connection.create({
      mentor,
      mentee,
      requestedBy: req.user._id,
      status: "pending",
    });

    await createNotification({
      user: recipientId,
      type: "connection_request",
      title: "New Connection Request",
      body: `${req.user.name} wants to connect with you.`,
      link: "/network",
      metadata: { connectionId: connection._id },
    });

    return res.status(201).json({ message: "Connection request sent successfully", connection });
  } catch (error) {
    return res.status(500).json({ message: "Error requesting connection", error: error.message });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }],
    })
      .populate("mentor", "name username email year roles")
      .populate("mentee", "name username email year roles")
      .sort({ updatedAt: -1 });

    return res.status(200).json(connections);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching connections", error: error.message });
  }
};

export const updateConnectionStatus = async (req, res) => {
  try {
    const { connectionId, status } = req.body;

    if (!connectionId || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Connection ID and valid status ('accepted' or 'rejected') are required" });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connection.status = status;
    await connection.save();

    const recipientId =
      connection.requestedBy.toString() === connection.mentor.toString()
        ? connection.mentee
        : connection.mentor;

    if (status === "accepted") {
      await createNotification({
        user: connection.requestedBy,
        type: "connection_accepted",
        title: "Connection Accepted!",
        body: `Your connection request was accepted.`,
        link: "/network",
      });
    }

    return res.status(200).json({ message: `Connection ${status}`, connection });
  } catch (error) {
    return res.status(500).json({ message: "Error updating connection status", error: error.message });
  }
};
