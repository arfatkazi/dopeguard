// backend/src/routes/userRoutes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  listDevices,
  downloadExtension,
  downloadStarterExtension,
  downloadPremiumExtension,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);
router.get("/me/devices", authMiddleware, listDevices);

// legacy single download
router.get("/extension-download", authMiddleware, downloadExtension);

// new: separate starter / premium downloads
router.get("/download/starter", authMiddleware, downloadStarterExtension);
router.get("/download/premium", authMiddleware, downloadPremiumExtension);

export default router;
