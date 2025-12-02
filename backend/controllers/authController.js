import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ======================================================
   🍪 COOKIE OPTIONS (Cross-Origin + Localhost Safe)
====================================================== */
const createCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd ? true : false, // true only in production (HTTPS)
    sameSite: isProd ? "None" : "Lax", // ✅ Lax for HTTP local dev
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

/* ======================================================
   🧍 REGISTER USER (Signup)
====================================================== */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must include uppercase, lowercase, number, and special character",
      });
    }

    // ✅ Create new user
    const user = await User.create({ name, email, password });

    // ✅ Generate JWT
    const token = generateToken(user);

    // ✅ Set token cookie
    const cookieOptions = createCookieOptions();
    res.cookie("token", token, cookieOptions);

    console.log("✅ Register: cookie set with options:", cookieOptions);
    console.log("✅ Register: user created", {
      id: user._id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ======================================================
   🔑 LOGIN USER
====================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user);
    user.lastLogin = new Date();
    await user.save();

    // ✅ Set token cookie again
    const cookieOptions = createCookieOptions();
    res.cookie("token", token, cookieOptions);

    console.log("✅ Login successful for:", user.email);
    console.log("🍪 Cookie options used:", cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ======================================================
   🧾 VERIFY TOKEN
====================================================== */
export const verifyToken = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(req.user._id || req.user.id).select(
      "-password"
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // ⭐ AUTO-EXPIRE LOGIC (IMPORTANT FIX)
    if (
      user.planExpiry &&
      user.subscriptionStatus === "active" &&
      user.planExpiry < new Date()
    ) {
      user.subscriptionStatus = "expired";
      await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ======================================================
   🚪 LOGOUT USER
====================================================== */
export const logoutUser = async (req, res) => {
  try {
    const cookieOptions = createCookieOptions();
    res.clearCookie("token", cookieOptions);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // HASH IT BEFORE SAVING (this is the FIX)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken; // save hashed
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15;

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.RESET_URL}?token=${resetToken}`; // send raw

    await sendEmail(
      user.email,
      "Reset your DopeGuard password",
      `
       <p>Click below to reset your password:</p>
       <a href="${resetURL}">Reset Password</a>
       <p>This link expires in 15 minutes.</p>
      `
    );

    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: "Missing token" });
    if (!password)
      return res.status(400).json({ message: "Password required" });

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    // Auto login after reset
    const jwt = generateToken(user);

    res.cookie("token", jwt, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Password reset successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
