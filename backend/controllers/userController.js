// backend/src/controllers/userController.js
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { ok, fail } from "../utils/response.js";

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
    // never allow changing sensitive fields here (plan, payments etc)
    await user.save();

    return ok(res, { user }, "Profile updated");
  } catch (err) {
    console.error("updateProfile error:", err);
    return fail(res, 500, "Server error");
  }
};

/**
 * GET /api/user/devices
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
 * GET /api/user/extension-download
 * Sends the extension ZIP stored on server (you must create zip at path)
 */
export const downloadExtension = async (req, res) => {
  try {
    // NOTE: put your zip in backend/public/extensions/dopeguard-extension.zip
    const zipPath = path.join(
      process.cwd(),
      "public",
      "extensions",
      "dopeguard-extension.zip"
    );
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
