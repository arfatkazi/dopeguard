import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

/* ============================================================
   INTERNAL: CREATE JWT TOKEN
   ============================================================ */
function makeToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/* ============================================================
   EXTENSION LOGIN  (POST /api/extension/login)
   ============================================================ */
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
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    // register/update device
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
        plan: user.plan,
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

/* ============================================================
   EXTENSION VERIFY (GET /api/extension/verify)
   DOES NOT USE authMiddleware — parses JWT internally
   ============================================================ */
export const extensionVerify = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");

    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        active: false,
        message: "Token missing",
      });
    }

    // decode token manually
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        active: false,
        message: "Invalid or expired token",
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

    /* -----------------------------------------------------------
       AUTO-EXPIRE LOGIC
       ----------------------------------------------------------- */
    const now = new Date();
    const expiry = new Date(user.planExpiry);

    if (
      user.planExpiry &&
      user.subscriptionStatus === "active" &&
      expiry.getTime() < now.getTime()
    ) {
      user.subscriptionStatus = "expired";
      await user.save();

      return res.json({
        success: true,
        active: false,
        user: {
          email: user.email,
          plan: "Expired",
          subscriptionStatus: "expired",
        },
        message: "Subscription expired",
      });
    }

    /* -----------------------------------------------------------
       ACTIVE SUBSCRIPTION
       ----------------------------------------------------------- */
    if (user.subscriptionStatus === "active") {
      return res.json({
        success: true,
        active: true,
        user: {
          email: user.email,
          plan: user.plan,
          planExpiry: user.planExpiry,
          subscriptionStatus: user.subscriptionStatus,
        },
      });
    }

    /* -----------------------------------------------------------
       INACTIVE / FREE USERS
       ----------------------------------------------------------- */
    return res.json({
      success: true,
      active: false,
      user: {
        email: user.email,
        plan: user.plan || "Free",
        planExpiry: user.planExpiry,
        subscriptionStatus: user.subscriptionStatus,
      },
      message: "Subscription inactive",
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
