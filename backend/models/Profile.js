import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    githubUsername: {
      type: String,
      default: "",
    },
    leetcodeUsername: {
      type: String,
      default: "",
    },
    gfgUsername: {
      type: String,
      default: "",
    },
    gamificationPoints: {
      type: Number,
      default: 0,
    },
    totalDynamicScore: {
      type: Number,
      default: 0,
    },
    combinedStreak: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    contributionGraph: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    platformBreakdown: {
      github: { type: Number, default: 0 },
      leetcode: { type: Number, default: 0 },
      gfg: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
