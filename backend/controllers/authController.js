import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Goal from "../models/Goal.js";
import Connection from "../models/Connection.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { sendOtpEmail } from "../utils/email.js";
import { ensureUniqueUsername } from "../utils/username.js";
import { validateEmail, validatePassword, normalizeEmail, normalizeUsername } from "../utils/validation.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  try {
    const { name, username, email, password, year, roles, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const cleanEmail = normalizeEmail(email);
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check college email requirement (@satiengg.in) unless adminSecret matches
    const isAdminRegistration = adminSecret && adminSecret === process.env.ADMIN_SECRET;
    if (!cleanEmail.endsWith("@satiengg.in") && !isAdminRegistration) {
      return res.status(400).json({
        message: "Registration is restricted to college email (@satiengg.in).",
      });
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const existingEmailUser = await User.findOne({ email: cleanEmail });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const finalUsername = await ensureUniqueUsername({
      username: normalizeUsername(username),
      email: cleanEmail,
      name,
    });

    const userRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["mentee"];
    if (userRoles.includes("admin") && !isAdminRegistration) {
      return res.status(403).json({ message: "Invalid admin key for admin registration." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      username: finalUsername,
      email: cleanEmail,
      password: hashedPassword,
      year: year || "1st Year",
      roles: userRoles,
      isEmailVerified: false,
      emailVerificationOtp: otp,
      emailOtpExpiry: otpExpiry,
    });

    await sendOtpEmail({
      to: cleanEmail,
      subject: "Campus Matrix - Email Verification OTP",
      heading: "Welcome to Campus Matrix",
      body: "Please use the OTP code below to verify your email address.",
      code: otp,
    });

    return res.status(201).json({
      message: "Signup successful. Verification OTP sent to your email.",
      email: cleanEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup", error: error.message });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email is already verified." });
    }

    if (
      !user.emailVerificationOtp ||
      String(user.emailVerificationOtp).trim() !== String(otp).trim() ||
      !user.emailOtpExpiry ||
      new Date() > new Date(user.emailOtpExpiry)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = null;
    user.emailOtpExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Server error during email verification", error: error.message });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    const otp = generateOtp();
    user.emailVerificationOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendOtpEmail({
      to: cleanEmail,
      subject: "Campus Matrix - Resend Verification OTP",
      heading: "Verify Your Email",
      body: "Use the new OTP code below to verify your account.",
      code: otp,
    });

    return res.status(200).json({ message: "Verification OTP resent successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, email, username, password } = req.body;
    const identifier = emailOrUsername || email || username;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required." });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
        email: user.email,
        requiresVerification: true,
      });
    }

    const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
    });

    const profile = await Profile.findOne({ user: user._id });

    const userRes = user.toObject();
    delete userRes.password;
    delete userRes.emailVerificationOtp;
    delete userRes.resetPasswordOtp;

    userRes.hasProfile = !!profile;
    userRes.profileImage = profile?.profileImage || "";

    return res.status(200).json({
      message: "Login successful",
      user: userRes,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendOtpEmail({
      to: cleanEmail,
      subject: "Campus Matrix - Password Reset OTP",
      heading: "Reset Your Password",
      body: "Use the OTP code below to reset your password.",
      code: otp,
    });

    return res.status(200).json({ message: "Password reset OTP sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to request password reset", error: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || user.resetPasswordOtp !== otp || !user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user || user.resetPasswordOtp !== otp || !user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const userRes = req.user.toObject();
    delete userRes.password;
    userRes.hasProfile = !!profile;
    userRes.profileImage = profile?.profileImage || "";
    userRes.profile = profile || null;

    return res.status(200).json(userRes);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get user profile", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
    });
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Logout error", error: error.message });
  }
};

export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Profile.deleteOne({ user: userId });
    await Goal.deleteMany({ user: userId });
    await Connection.deleteMany({ $or: [{ mentor: userId }, { mentee: userId }] });
    await Message.deleteMany({ sender: userId });
    await Chat.deleteMany({ users: userId });
    await User.deleteOne({ _id: userId });

    res.clearCookie("token", { path: "/" });
    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete account", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      return res.status(400).json({ message: pwdError });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};
