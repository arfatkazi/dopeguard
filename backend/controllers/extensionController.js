import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

/* ------------------------------ TOKEN MAKER ------------------------------ */
function makeToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* --------------------------- EXTENSION LOGIN ----------------------------- */
export const extensionLogin = async (req, res) => {
  try {
    const { email, password, deviceInfo = {} } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // register / update device info
    const deviceId = deviceInfo.deviceId || "ext-" + user._id;
    const payload = {
      deviceId,
      os: deviceInfo.os || "Unknown",
      browser: deviceInfo.browser || "Unknown",
      lastActive: new Date(),
    };

    const idx = user.devices.findIndex((d) => d.deviceId === deviceId);
    if (idx === -1) user.devices.push(payload);
    else user.devices[idx] = payload;

    await user.save();

    const token = makeToken(user);

    return res.json({
      success: true,
      message: "Logged in",
      token,
      user: {
        email: user.email,
        plan: user.plan || "Free",
        planExpiry: user.planExpiry,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    console.error("EXT LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ------------------------ EXTENSION VERIFY ------------------------------- */
export const extensionVerify = async (req, res) => {
  try {
    // Disable cache ALWAYS (fixes 304 bug)
    res.setHeader("Cache-Control", "no-store");

    const authorization = req.headers.authorization || "";
    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        active: false,
        message: "Token missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        active: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        active: false,
        message: "User not found",
      });
    }

    const now = new Date();

    // expired plan
    if (user.planExpiry && user.planExpiry < now) {
      user.subscriptionStatus = "inactive";
      await user.save();

      return res.json({
        success: true,
        active: false,
        user: {
          email: user.email,
          plan: "Expired",
        },
        message: "Subscription expired",
      });
    }

    // no active subscription
    if (user.subscriptionStatus !== "active") {
      return res.json({
        success: true,
        active: false,
        user: {
          email: user.email,
          plan: user.plan || "Free",
        },
        message: "Subscription inactive",
      });
    }

    // ACTIVE
    return res.json({
      success: true,
      active: true,
      user: {
        email: user.email,
        plan: user.plan || "Premium",
        planExpiry: user.planExpiry,
      },
    });
  } catch (err) {
    console.error("EXT VERIFY ERROR:", err);
    return res.status(500).json({
      success: false,
      active: false,
      message: "Server error",
    });
  }
};
