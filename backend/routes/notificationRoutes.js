import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/read-all", verifyToken, markAllNotificationsRead);
router.put("/:id/read", verifyToken, markNotificationRead);

export default router;
