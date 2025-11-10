import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createBillingPortalSession,
  createCheckoutSession,
  stripeWebhook,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// ✅ Stripe checkout (buy plan)
router.post("/checkout", authMiddleware, createCheckoutSession);

// ✅ Stripe billing portal (manage plan)
router.get("/billing-portal", authMiddleware, createBillingPortalSession);

// ✅ Stripe webhook (Stripe calls this, not your frontend)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
