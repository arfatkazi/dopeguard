// backend/src/controllers/userController.js
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { ok, fail } from "../utils/response.js";

const EXT_DIR = path.join(process.cwd(), "public", "extensions");

/**
 * GET /api/user/me
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // authMiddleware attaches user (without password)
    if (!user) return fail(res, 401, "Unauthorized");

    return ok(res, { user }, "User profile");
  } catch (err) {
    console.error("getProfile error:", err);
    return fail(res, 500, "Server error");
  }
};

/**
 * PATCH /api/user/me
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return fail(res, 404, "User not found");

    const { name } = req.body;
    if (name) user.name = name.trim();
    // ❗ do not allow plan/payment changes here

    await user.save();
    return ok(res, { user }, "Profile updated");
  } catch (err) {
    console.error("updateProfile error:", err);
    return fail(res, 500, "Server error");
  }
};

/**
 * GET /api/user/me/devices
 */
export const listDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("devices");
    if (!user) return fail(res, 404, "User not found");
    return ok(res, { devices: user.devices }, "Devices fetched");
  } catch (err) {
    console.error("listDevices error:", err);
    return fail(res, 500, "Server error");
  }
};

/**
 * (legacy) GET /api/user/extension-download
 * Single ZIP download if you still need it
 */
export const downloadExtension = async (req, res) => {
  try {
    const zipPath = path.join(EXT_DIR, "dopeguard-extension.zip");
    if (!fs.existsSync(zipPath)) return fail(res, 404, "Extension not found");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dopeguard-extension.zip"
    );
    res.sendFile(zipPath);
  } catch (err) {
    console.error("downloadExtension error:", err);
    return fail(res, 500, "Server error");
  }
};

/**
 * GET /api/user/download/starter
 * → DopeGuard Essential / Starter extension ZIP
 */
export const downloadStarterExtension = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan subscriptionStatus"
    );
    if (!user) return fail(res, 404, "User not found");

    if (user.subscriptionStatus !== "active") {
      return fail(res, 403, "Your subscription is not active");
    }

    const allowedPlans = ["STARTER", "FOCUS_PACK", "GROWTH", "ELITE"];
    if (!allowedPlans.includes(user.plan)) {
      return fail(
        res,
        403,
        "Your current plan does not include the Starter extension"
      );
    }

    const zipPath = path.join(EXT_DIR, "dopeguard-starter.zip");
    if (!fs.existsSync(zipPath)) return fail(res, 404, "Starter ZIP not found");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dopeguard-starter.zip"
    );
    return res.sendFile(zipPath);
  } catch (err) {
    console.error("downloadStarterExtension error:", err);
    return fail(res, 500, "Server error");
  }
};

/**
 * GET /api/user/download/premium
 * → DopeGuard Premium extension ZIP
 */
export const downloadPremiumExtension = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan subscriptionStatus"
    );
    if (!user) return fail(res, 404, "User not found");

    if (user.subscriptionStatus !== "active") {
      return fail(res, 403, "Your subscription is not active");
    }

    const allowedPlans = ["STARTER", "FOCUS_PACK", "GROWTH", "ELITE"];
    if (!allowedPlans.includes(user.plan)) {
      return fail(
        res,
        403,
        "Your current plan does not include the Premium extension"
      );
    }

    const zipPath = path.join(EXT_DIR, "dopeguard-premium.zip");
    if (!fs.existsSync(zipPath)) return fail(res, 404, "Premium ZIP not found");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dopeguard-premium.zip"
    );
    return res.sendFile(zipPath);
  } catch (err) {
    console.error("downloadPremiumExtension error:", err);
    return fail(res, 500, "Server error");
  }
};
