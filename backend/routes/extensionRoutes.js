import express from "express";
import {
  extensionLogin,
  extensionVerify,
} from "../controllers/extensionController.js";

const router = express.Router();

router.post("/login", extensionLogin);
router.get("/verify", extensionVerify);

export default router;
