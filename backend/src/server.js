// =============================================================
// 🧠 DopeGuard Backend Server — Razorpay + Auth + Arcjet + Security Layer
// =============================================================

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import connectDB from "../config/db.js";
import extensionRoutes from "../routes/extensionRoutes.js";

// ✅ Load environment variables first
dotenv.config();
connectDB();

// ✅ Import Routes
import authRoutes from "../routes/authRoutes.js";
import paymentRoutes from "../routes/paymentRoutes.js";

// ✅ Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================
// 🌍 CORS Configuration — FIXED for localhost cookie sharing
// =============================================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow curl/postman (no origin)
      if (!origin) return callback(null, true);

      // allow known local dev hosts
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // allow chrome extension pages in dev
      try {
        if (origin.startsWith("chrome-extension://"))
          return callback(null, true);
      } catch (e) {}

      // optionally allow all during dev (uncomment if you prefer)
      // if (process.env.NODE_ENV !== 'production') return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =============================================================
// 🧩 Essential Middleware
// =============================================================
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// =============================================================
// 🧠 Arcjet — Abuse + Bot Protection
// =============================================================
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }), // Prevents XSS, SQLi, etc.
    detectBot({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      allow: ["CATEGORY:SEARCH_ENGINE", "LOCALHOST"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

// 🔐 Arcjet Middleware
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please wait.",
        });

      if (decision.reason.isBot())
        return res
          .status(403)
          .json({ success: false, message: "Bot access denied." });

      return res
        .status(403)
        .json({ success: false, message: "Forbidden request." });
    }

    if (decision.ip?.isHosting() || decision.results.some(isSpoofedBot)) {
      return res
        .status(403)
        .json({ success: false, message: "Suspicious client detected." });
    }

    next();
  } catch (err) {
    console.error("Arcjet Error:", err);
    next();
  }
});

// =============================================================
// ⚙️ Rate Limiter — Brute Force & DoS Protection
// =============================================================
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});
app.use(limiter);

// =============================================================
// 📁 Main API Routes
// =============================================================
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/extension", extensionRoutes);

// =============================================================
// ❤️ Health Check Endpoint
// =============================================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🧠 DopeGuard backend running securely with Arcjet ⚡ + Razorpay 💳 + JWT 🪙",
  });
});

// =============================================================
// ❌ Global Error Handler
// =============================================================
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack || err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =============================================================
// 🚀 Start Server
// =============================================================
app.listen(PORT, "127.0.0.1", () => {
  console.log(`⚙️  DopeGuard API running at: http://127.0.0.1:${PORT}`);
  console.log("✅ Server started successfully with Arcjet + Razorpay + Auth");
  console.log(
    "🌍 Allowed Origin:",
    process.env.FRONTEND_URL || "http://127.0.0.1:5173"
  );
});
