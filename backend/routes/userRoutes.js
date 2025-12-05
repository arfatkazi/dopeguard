// backend/src/routes/userRoutes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  listDevices,
  downloadExtension,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);
router.get("/me/devices", authMiddleware, listDevices);

// download extension zip (only for active users)
router.get("/extension-download", authMiddleware, downloadExtension);

export default router;
