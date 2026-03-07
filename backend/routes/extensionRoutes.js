import express from "express";
import {
  extensionLogin,
  extensionVerify,
} from "../controllers/extensionController.js";

const router = express.Router();

/**
 * PUBLIC — Extension Login
 * Body: { email, password, deviceInfo }
 * Response: { success, token, user }
 */
router.post("/login", extensionLogin);

/**
 * PUBLIC — Extension Verify
 * Uses JWT directly inside controller.
 * NO authMiddleware here.
 */
router.get("/verify", extensionVerify);

export default router;
