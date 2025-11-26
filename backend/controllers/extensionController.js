import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

// issue JWT for extension only
function makeToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      plan: user.plan,
      planExpiry: user.planExpiry,
      subscriptionStatus: user.subscriptionStatus,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export const extensionLogin = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

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

    // device registration
    if (deviceInfo?.deviceId) {
      const idx = user.devices.findIndex(
        (d) => d.deviceId === deviceInfo.deviceId
      );

      const payload = {
        deviceId: deviceInfo.deviceId,
        os: deviceInfo.os || "Unknown",
        browser: deviceInfo.browser || "Chrome",
        lastActive: new Date(),
      };

      if (idx === -1) {
        user.devices.push(payload);
      } else {
        user.devices[idx] = payload;
      }
      await user.save();
    }

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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const extensionVerify = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");

    if (!token)
      return res.status(401).json({ success: false, message: "Token missing" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // subscription active?
    const active =
      user.subscriptionStatus === "active" &&
      user.plan &&
      user.planExpiry &&
      user.planExpiry > new Date();

    return res.json({
      success: true,
      active,
      user: {
        email: user.email,
        plan: user.plan,
        planExpiry: user.planExpiry,
      },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
