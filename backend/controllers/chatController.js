import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

export const accessOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId parameter is required" });
    }

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot create chat with yourself" });
    }

    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name username email profileImage",
    });

    if (isChat.length > 0) {
      return res.status(200).json(isChat[0]);
    }

    const chatData = {
      users: [req.user._id, userId],
      requestedBy: req.user._id,
      status: "accepted", // Direct creation accepted
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");

    return res.status(201).json(fullChat);
  } catch (error) {
    return res.status(500).json({ message: "Error accessing or creating chat", error: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
      status: "accepted",
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name username email",
    });

    return res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

export const getChatRequests = async (req, res) => {
  try {
    const requests = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
      status: "pending",
      requestedBy: { $ne: req.user._id },
    }).populate("users", "-password").populate("requestedBy", "-password");

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chat requests", error: error.message });
  }
};

export const searchChatUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json([]);
    }

    const searchRegex = new RegExp(q, "i");
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: searchRegex }, { username: searchRegex }, { email: searchRegex }],
    }).select("-password").limit(10);

    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } });

    const result = users.map((u) => {
      const p = profiles.find((prof) => prof.user.toString() === u._id.toString());
      return {
        ...u.toObject(),
        profileImage: p?.profileImage || "",
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error searching chat users", error: error.message });
  }
};

export const updateChatRequestStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.status = status;
    if (status === "accepted") {
      chat.acceptedAt = new Date();
    }
    await chat.save();

    const updatedChat = await Chat.findById(chatId).populate("users", "-password");
    return res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(500).json({ message: "Error updating chat request status", error: error.message });
  }
};
