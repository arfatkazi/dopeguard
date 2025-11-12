import express from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify user token and fetch user info
 * @access  Private (requires valid JWT)
 */
router.get("/verify", authMiddleware, verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logs user out (clears auth cookie) even if token expired
 * @access  Public
 */
router.post("/logout", logoutUser);

export default router;
