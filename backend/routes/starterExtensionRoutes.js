import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  activateStarterKey,
  verifyStarterKey,
  deactivateStarterKey,
} from "../controllers/starterExtensionController.js";

const router = express.Router();

// From website (requires JWT cookie / auth header)
router.post("/activate", authMiddleware, activateStarterKey);
router.post("/deactivate", authMiddleware, deactivateStarterKey);

// From extension (no login, uses access key)
router.get("/verify", verifyStarterKey);

export default router;
