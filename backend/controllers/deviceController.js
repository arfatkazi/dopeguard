// backend/controllers/deviceController.js
import Device from "../models/Device.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const listDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    // Prefer embedded devices in User document
    const user = await User.findById(userId).select("devices").lean();
    if (user && user.devices && user.devices.length) {
      return res.json({ success: true, devices: user.devices });
    }

    // fallback to Device collection
    const devices = await Device.find({
      userId: new mongoose.Types.ObjectId(userId), // ✅ FIXED
    })
      .sort({ lastSync: -1 })
      .lean();

    return res.json({ success: true, devices });
  } catch (err) {
    console.error("LIST DEVICES", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeDevice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.params;

    if (!deviceId) {
      return res
        .status(400)
        .json({ success: false, message: "deviceId required" });
    }

    // remove from user.devices
    const user = await User.findById(userId);
    if (user) {
      const idx = user.devices.findIndex(
        (d) =>
          d.deviceId === deviceId || (d._id && d._id.toString() === deviceId)
      );

      if (idx !== -1) {
        user.devices.splice(idx, 1);
        await user.save();
        return res.json({ success: true, message: "Device removed" });
      }
    }

    // fallback Device collection
    await Device.deleteOne({
      userId: new mongoose.Types.ObjectId(userId), // ✅ FIXED
      $or: [{ deviceId }, { _id: deviceId }],
    });

    return res.json({ success: true, message: "Device removed" });
  } catch (err) {
    console.error("REMOVE DEVICE", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
