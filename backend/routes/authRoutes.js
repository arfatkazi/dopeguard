import express from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/verify
 */
router.get("/verify", authMiddleware, verifyToken);

/**
 * @route   POST /api/auth/logout
 */
router.post("/logout", logoutUser);

/**
 * @route   POST /api/auth/forgot-password
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 */
router.post("/reset-password/:token", resetPassword);

export default router;
