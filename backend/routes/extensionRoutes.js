import express from "express";
import {
  extensionLogin,
  extensionVerify,
} from "../controllers/extensionController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * PUBLIC ROUTE
 * Extension login happens with email + password
 * Returns JWT token → saved by chrome extension
 */
router.post("/login", extensionLogin);

/**
 * PROTECTED ROUTE
 * Requires:
 * 1) Valid JWT token
 * 2) Active subscription
 *
 * If subscription expired → return active:false
 */
router.get("/verify", authMiddleware, extensionVerify);

export default router;
