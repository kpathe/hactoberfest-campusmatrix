import express from "express";
import { sendMessage, getMessagesByChatId } from "../controllers/messageController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getMessagesByChatId);

export default router;
