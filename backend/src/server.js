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
import subscriptionRoutes from "../routes/subscriptionRoutes.js";

// ✅ Import your route files (uncomment once created)
// import authRoutes from "./routes/authRoutes.js";
// import contactRoutes from "./routes/contactRoutes.js";
// import subscriptionRoutes from "./routes/subscriptionRoutes.js";
// import extensionRoutes from "./routes/extensionRoutes.js";

dotenv.config();
connectDB();
/* ----------------------------
📡 Setup and Initialization
---------------------------- */
const app = express();
const PORT = process.env.PORT || 8080;

/* ----------------------------
🌍 Security & Utility Middleware
---------------------------- */
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ----------------------------
🧠 Arcjet — API Abuse & Bot Protection
---------------------------- */
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // 🛡️ Shield (SQLi, XSS, command injection, etc.)
    shield({ mode: "LIVE" }),

    // 🤖 Bot Detection
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
        // Optional:
        // "CATEGORY:MONITOR",
        // "CATEGORY:PREVIEW",
      ],
    }),

    // ⏳ Rate Limiting — token bucket algorithm
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // 5 tokens every interval
      interval: 10, // 10 seconds
      capacity: 10, // max 10 tokens
    }),
  ],
});

/* ----------------------------
🔐 Arcjet Protection Middleware
---------------------------- */
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Too Many Requests" });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ error: "No bots allowed" });
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    if (decision.ip?.isHosting() || decision.results.some(isSpoofedBot)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (err) {
    console.error("Arcjet error:", err);
    next();
  }
});

/* ----------------------------
🛡️ Express Rate Limiter (Extra Layer)
---------------------------- */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ----------------------------
📁 API Routes
---------------------------- */
// app.use("/api/auth", authRoutes);
// app.use("/api/contact", contactRoutes);
// app.use("/api/subscription", subscriptionRoutes);
// app.use("/api/extension", extensionRoutes);
app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));
app.use("/api/subscription", subscriptionRoutes);

/* ----------------------------
❤️ Health Check Route
---------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🧠 DopeGuard backend running securely with Arcjet ⚡",
  });
});

/* ----------------------------
❌ Error Handler
---------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ----------------------------
🚀 Server Start
---------------------------- */
app.listen(PORT, () => {
  console.log(`⚙️  DopeGuard API running at: http://localhost:${PORT}`);
  console.log(`server is running successfully ✅`);
});
