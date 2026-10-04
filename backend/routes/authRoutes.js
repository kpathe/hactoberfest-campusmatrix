import express from "express";
import {
  changePassword,
  deleteMyAccount,
  getMe,
  login,
  logoutUser,
  requestPasswordReset,
  resendVerificationOtp,
  resetPassword,
  signup,
  verifyEmailOtp,
  verifyResetOtp,
} from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmailOtp);
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/me", verifyToken, getMe);
router.post("/logout", logoutUser);
router.delete("/account", verifyToken, deleteMyAccount);
router.put("/change-password", verifyToken, changePassword);

router.get("/check-auth", verifyToken, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

export default router;
