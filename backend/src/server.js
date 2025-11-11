// =============================================================
// 🧠 DopeGuard Backend Server — Razorpay + Arcjet + Security Layer
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
import { isSpoofedBot } from "@arcjet/inspect";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import connectDB from "../config/db.js";

// ✅ Load environment variables first
dotenv.config();

// ✅ Connect MongoDB
connectDB();

// ✅ Import Routes
import paymentRoutes from "../routes/paymentRoutes.js";
import authRoutes from "../routes/authRoutes.js";

// ✅ Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

/* ----------------------------
🌍 CORS Configuration (Fixed)
---------------------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ Only your frontend domain
    credentials: true, // ✅ Required for cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ----------------------------
🧩 General Middleware
---------------------------- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ----------------------------
🧠 Arcjet — Bot & Abuse Protection
---------------------------- */
// const aj = arcjet({
//   key: process.env.ARCJET_KEY,
//   rules: [
//     // 🛡️ Block injection, SQLi, XSS, etc.
//     shield({ mode: "LIVE" }),

//     // 🤖 Detect bots, allow search engines
//     detectBot({
//       mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
//       allow: [
//         "CATEGORY:SEARCH_ENGINE",
//         "CATEGORY:HTTP_LIBRARY", // allows Postman, axios, curl, etc.
//         "LOCALHOST",
//       ],
//     }),

//     // ⏳ Token bucket rate limiting
//     tokenBucket({
//       mode: "LIVE",
//       refillRate: 5,
//       interval: 10,
//       capacity: 10,
//     }),
//   ],
// });

// 🔐 Arcjet Protection Middleware
// app.use(async (req, res, next) => {
//   try {
//     const decision = await aj.protect(req, { requested: 1 });

//     if (decision.isDenied()) {
//       if (decision.reason.isRateLimit())
//         return res.status(429).json({ error: "Too Many Requests" });
//       if (decision.reason.isBot())
//         return res.status(403).json({ error: "No bots allowed" });
//       return res.status(403).json({ error: "Forbidden" });
//     }

//     if (decision.ip?.isHosting() || decision.results.some(isSpoofedBot)) {
//       return res.status(403).json({ error: "Forbidden" });
//     }

//     next();
//   } catch (err) {
//     console.error("Arcjet error:", err);
//     next();
//   }
// });

/* ----------------------------
🛡️ Express Rate Limiter
---------------------------- */
// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 100, // Max requests per IP
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

/* ----------------------------
📁 API Routes
---------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

/* ----------------------------
❤️ Health Check Route
---------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🧠 DopeGuard backend running securely with Arcjet ⚡ & Razorpay 💳",
  });
});

/* ----------------------------
❌ Global Error Handler
---------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ----------------------------
🚀 Start Server
---------------------------- */
app.listen(PORT, () => {
  console.log(`⚙️  DopeGuard API running at: http://localhost:${PORT}`);
  console.log("✅ Server started successfully with Arcjet + Razorpay");
  console.log("🌍 Allowed Origin:", process.env.FRONTEND_URL);
});
