import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: "ChatId and content are required" });
    }

    const newMessage = {
      sender: req.user._id,
      content: content.trim(),
      chat: chatId,
    };

    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name username email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name username email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

export const getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name username email")
      .populate("chat")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};
