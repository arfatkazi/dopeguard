// backend/controllers/starterExtensionController.js
import crypto from "crypto";
import User from "../models/User.js";

/**
 * Helper: generate a fresh Starter/Essential key
 */
const generateStarterKey = () => {
  // 8-char hex key, e.g. "F1A2B3C4"
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

export const activateStarterKey = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    // Must have active STARTER plan (you can adjust allowed plans here)
    // Must have active paid plan that includes Essential extension
    const allowedPlansForStarter = ["STARTER", "FOCUS_PACK", "GROWTH", "ELITE"];

    if (
      user.subscriptionStatus !== "active" ||
      !allowedPlansForStarter.includes(user.plan)
    ) {
      return res.status(403).json({
        success: false,
        message: "Your current plan does not include the Essential extension.",
      });
    }

    // If plan expired, auto-mark as expired + refuse
    if (!user.planExpiry || user.planExpiry < now) {
      user.subscriptionStatus = "expired";
      user.starterKeyActive = false;
      await user.save();

      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Renew to get a new key.",
      });
    }

    // Create starterKey if not present
    if (!user.starterKey) {
      user.starterKey = generateStarterKey();
      user.starterKeyCreatedAt = now;
    }

    // Activate key
    user.starterKeyActive = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Starter key activated",
      starterKey: user.starterKey,
      plan: user.plan,
      planExpiry: user.planExpiry,
    });
  } catch (error) {
    console.error("activateStarterKey error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/extension/starter/verify?key=XXXX
 * - Called from Starter/Essential extension (no login)
 * - Only checks key + subscription status
 */
export const verifyStarterKey = async (req, res) => {
  try {
    const key = (req.query.key || "").trim();

    if (!key) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Key is required",
      });
    }

    const user = await User.findOne({ starterKey: key.toUpperCase() });

    // Invalid or inactive key
    if (!user || !user.starterKeyActive) {
      return res.status(200).json({
        success: true,
        valid: false,
        reason: "invalid_key",
      });
    }

    const now = new Date();

    // If plan expired or not active, deactivate key
    if (
      user.subscriptionStatus !== "active" ||
      !user.planExpiry ||
      user.planExpiry < now
    ) {
      user.starterKeyActive = false;
      await user.save();

      return res.status(200).json({
        success: true,
        valid: false,
        reason: "expired_subscription",
      });
    }

    // OK – valid key
    user.starterKeyLastUsedAt = now;
    await user.save();

    return res.status(200).json({
      success: true,
      valid: true,
      plan: user.plan,
      planExpiry: user.planExpiry,
    });
  } catch (error) {
    console.error("verifyStarterKey error:", error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/extension/starter/deactivate
 * - Called from WEBSITE (user logged in)
 * - Turns off current Starter key
 */
export const deactivateStarterKey = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.starterKeyActive = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Starter key deactivated",
    });
  } catch (error) {
    console.error("deactivateStarterKey error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
