import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

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
