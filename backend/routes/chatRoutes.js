import express from "express";
import {
  accessOrCreateChat,
  getAllChats,
  getChatRequests,
  searchChatUsers,
  updateChatRequestStatus,
} from "../controllers/chatController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/search", verifyToken, searchChatUsers);
router.get("/requests", verifyToken, getChatRequests);
router.post("/", verifyToken, accessOrCreateChat);
router.get("/", verifyToken, getAllChats);
router.put("/:chatId/request-status", verifyToken, updateChatRequestStatus);

export default router;
