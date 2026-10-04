import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/", verifyToken, getLeaderboard);

export default router;
