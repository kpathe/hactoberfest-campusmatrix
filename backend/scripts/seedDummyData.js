import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Connection from "../models/Connection.js";
import Goal from "../models/Goal.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

dotenv.config();

const sampleUsers = [
  {
    name: "Aarav Sharma",
    username: "aarav.sharma",
    email: "aarav.sharma@satiengg.in",
    roles: ["mentee"],
    year: 1,
    department: "Computer Science",
    bio: "Interested in AI, hackathons, and frontend systems.",
    skills: ["React", "JavaScript", "Figma"],
    interests: ["AI", "Hackathons", "Product Design"],
    languages: ["English", "Hindi"],
    gender: "Male",
  },
  {
    name: "Sneha Patel",
    username: "sneha.patel",
    email: "sneha.patel@satiengg.in",
    roles: ["mentee"],
    year: 2,
    department: "Information Technology",
    bio: "Exploring backend systems and competitive programming.",
    skills: ["Node.js", "MongoDB", "DSA"],
    interests: ["Backend", "CP", "Open Source"],
    languages: ["English", "Hindi"],
    gender: "Female",
  },
  {
    name: "Ishaan Verma",
    username: "ishaan.verma",
    email: "ishaan.verma@satiengg.in",
    roles: ["mentor"],
    year: 4,
    department: "Computer Science",
    bio: "Senior mentor focused on full-stack product building and interview prep.",
    skills: ["React", "Node.js", "System Design"],
    interests: ["Startups", "Interviews", "Open Source"],
    languages: ["English", "Hindi"],
    gender: "Male",
  },
  {
    name: "Priya Nair",
    username: "priya.nair",
    email: "priya.nair@satiengg.in",
    roles: ["mentor"],
    year: 4,
    department: "Electronics",
    bio: "Mentor for IoT, embedded systems, and technical project planning.",
    skills: ["Embedded C", "IoT", "Project Planning"],
    interests: ["IoT", "Research", "Leadership"],
    languages: ["English", "Hindi"],
    gender: "Female",
  },
];

const upsertUser = async (userData, passwordHash) => {
  const user = await User.findOneAndUpdate(
    { email: userData.email },
    {
      $set: {
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: passwordHash,
        roles: userData.roles,
        year: userData.year,
        hasProfile: true,
        isEmailVerified: true,
      },
    },
    { new: true, upsert: true }
  );

  await Profile.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        department: userData.department,
        bio: userData.bio,
        skills: userData.skills,
        interests: userData.interests,
        languages: userData.languages,
        gender: userData.gender,
        gamificationPoints: 120,
        totalDynamicScore: 240,
        combinedStreak: 12,
        badges: ["Bronze Scholar"],
      },
    },
    { upsert: true }
  );

  return user;
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash("Campus123", 10);

  const users = {};
  for (const sampleUser of sampleUsers) {
    users[sampleUser.username] = await upsertUser(sampleUser, passwordHash);
  }

  const aarav = users["aarav.sharma"];
  const sneha = users["sneha.patel"];
  const ishaan = users["ishaan.verma"];
  const priya = users["priya.nair"];

  const connections = [
    { mentor: ishaan._id, mentee: aarav._id, requestedBy: aarav._id, status: "accepted" },
    { mentor: priya._id, mentee: sneha._id, requestedBy: sneha._id, status: "accepted" },
    { mentor: ishaan._id, mentee: sneha._id, requestedBy: sneha._id, status: "pending" },
  ];

  for (const connection of connections) {
    await Connection.findOneAndUpdate(
      { mentor: connection.mentor, mentee: connection.mentee },
      { $set: connection },
      { upsert: true }
    );
  }

  const task = await Goal.findOneAndUpdate(
    { user: aarav._id, title: "Build mentor intro card" },
    {
      $set: {
        user: aarav._id,
        title: "Build mentor intro card",
        description: "Design and implement a clean mentor intro card for the dashboard.",
        deadline: new Date(Date.now() + 5 * 86400000),
        assigner: ishaan._id,
        category: "task",
        priority: "high",
      },
    },
    { upsert: true, new: true }
  );

  let chat = await Chat.findOne({ users: { $all: [aarav._id, ishaan._id] } });
  if (!chat) {
    chat = await Chat.create({
      users: [aarav._id, ishaan._id],
      requestedBy: aarav._id,
      status: "accepted",
      acceptedAt: new Date(),
    });
  } else {
    chat.users = [aarav._id, ishaan._id];
    chat.requestedBy = aarav._id;
    chat.status = "accepted";
    chat.acceptedAt = new Date();
    await chat.save();
  }

  const existingMessage = await Message.findOne({ chat: chat._id, content: "Hi Ishaan, excited to work on the UI task." });
  if (!existingMessage) {
    const firstMessage = await Message.create({
      chat: chat._id,
      sender: aarav._id,
      content: "Hi Ishaan, excited to work on the UI task.",
      readBy: [aarav._id, ishaan._id],
    });
    await Chat.findByIdAndUpdate(chat._id, { latestMessage: firstMessage._id });
  }

  const notifications = [
    {
      user: aarav._id,
      type: "task_assigned",
      title: "New mentor task assigned",
      body: "Ishaan assigned you a UI implementation task.",
      link: "/goals",
      metadata: { taskId: task._id },
    },
    {
      user: ishaan._id,
      type: "connection_request",
      title: "New mentorship request",
      body: "Sneha wants to connect with you for backend guidance.",
      link: "/matching",
    },
  ];

  for (const notification of notifications) {
    const exists = await Notification.findOne({
      user: notification.user,
      title: notification.title,
      body: notification.body,
    });
    if (!exists) {
      await Notification.create(notification);
    }
  }

  console.log("Dummy data seeded successfully.");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Failed to seed dummy data:", error);
  await mongoose.disconnect();
  process.exit(1);
});
