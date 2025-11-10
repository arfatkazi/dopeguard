import express from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", authMiddleware, verifyToken);
router.post("/logout", logoutUser);

export default router;
