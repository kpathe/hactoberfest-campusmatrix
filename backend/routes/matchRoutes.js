import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getPotentialMatches, requestConnection, getMyConnections, updateConnectionStatus } from "../controllers/matchController.js";

const router = express.Router();

router.get("/potential", verifyToken, getPotentialMatches);
router.post("/request", verifyToken, requestConnection);
router.get("/my-connections", verifyToken, getMyConnections);
router.put("/status", verifyToken, updateConnectionStatus);

export default router;
