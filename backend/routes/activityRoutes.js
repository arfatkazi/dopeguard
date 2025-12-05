import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  listActivities,
  createActivity,
  weeklyStats,
  blockedSites,
  dopamineSpikes,
  dailyStats,
} from "../controllers/activityController.js";

const router = express.Router();

/* ============================================================
   MAIN ACTIVITY ROUTES (Protected)
   ============================================================ */

// Get list of raw activities
router.get("/", authMiddleware, listActivities);

// Log new activity (extension + web)
router.post("/", authMiddleware, createActivity);

// Weekly summary stats
router.get("/stats/weekly", authMiddleware, weeklyStats);

// Daily summary stats (MISSING earlier — now included)
router.get("/stats/daily", authMiddleware, dailyStats);

// Most blocked websites
router.get("/stats/blocked", authMiddleware, blockedSites);

// Dopamine spike hours
router.get("/stats/dopamine", authMiddleware, dopamineSpikes);

export default router;
