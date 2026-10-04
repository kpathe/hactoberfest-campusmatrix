import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import connectRoutes from "./routes/connectRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/connect", connectRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Socket.io Handlers
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("addUser", (userId) => {
    if (userId) {
      activeUsers.set(userId.toString(), socket.id);
      socket.join(userId.toString());
      console.log(`User ${userId} associated with socket ${socket.id}`);
    }
  });

  socket.on("joinRoom", (chatId) => {
    if (chatId) {
      socket.join(chatId.toString());
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    }
  });

  socket.on("typing", (chatId) => {
    if (chatId) {
      socket.to(chatId.toString()).emit("typing", chatId);
    }
  });

  socket.on("stopTyping", (chatId) => {
    if (chatId) {
      socket.to(chatId.toString()).emit("stopTyping", chatId);
    }
  });

  socket.on("newMessage", (messageData) => {
    const chat = messageData?.chat;
    if (!chat) return;

    if (chat._id) {
      socket.to(chat._id.toString()).emit("newMessage", messageData);
    }

    if (Array.isArray(chat.users)) {
      chat.users.forEach((user) => {
        const userId = user._id || user;
        if (userId && userId.toString() !== messageData.sender?._id?.toString()) {
          socket.to(userId.toString()).emit("newMessage", messageData);
        }
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of activeUsers.entries()) {
      if (sockId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/campus_matrix";

let isListening = false;
const startServer = (statusMessage) => {
  if (!isListening) {
    isListening = true;
    server.listen(PORT, () => {
      console.log(`Campus Matrix backend server running on port ${PORT} ${statusMessage}`);
    });
  }
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    startServer("");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    startServer("(MongoDB offline)");
  });
