import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  createProfile,
  getPublicProfile,
  getMyProfile,
  refreshStats,
  searchUsers,
  updateExternalHandles,
} from "../controllers/profileController.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware that sets req.user if a valid token is present, but doesn't block if missing
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) req.user = user;
    }
  } catch {
    // No valid token — continue as anonymous
  }
  next();
};

const router = express.Router();

router.post("/create-profile", verifyToken, createProfile);
router.put("/edit-profile", verifyToken, createProfile);
router.get("/me", verifyToken, getMyProfile);
router.get("/user/:username", optionalAuth, getPublicProfile);
router.get("/search", verifyToken, searchUsers);
router.post("/refresh-stats", verifyToken, refreshStats);
router.put("/handles", verifyToken, updateExternalHandles);

export default router;
