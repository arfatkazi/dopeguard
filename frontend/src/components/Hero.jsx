// src/components/Hero.jsx
import React from "react";
import { motion } from "framer-motion";
import { Star, DownloadCloud, Play } from "lucide-react";

export default function Hero({ chromeUrl = "#" }) {
  return (
    <section className="relative overflow-hidden container grid lg:grid-cols-2 items-center gap-12 py-20">
      {/* 🌌 Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[120px] opacity-70 pointer-events-none" />

      {/* 🧠 LEFT: Heading */}
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight"
        >
          The{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Shield
          </span>{" "}
          that protects your focus.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-5 text-lg text-white/80 max-w-xl leading-relaxed"
        >
          DopeGuard intelligently detects dopamine-heavy or NSFW content inside
          your browser — blurring distractions, boosting your focus, and keeping
          your mind clean and productive.
        </motion.p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/pricing"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-cyan-400 text-black font-semibold shadow-lg hover:shadow-cyan-400/40 transition-all hover:scale-[1.03]"
          >
            <Star size={16} /> Get Focused — ₹199/month
          </a>

          <button
            onClick={() => (window.location.href = chromeUrl)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 backdrop-blur bg-white/5 text-white/90 hover:bg-white/10 transition-all"
          >
            <DownloadCloud size={16} /> Install Extension
          </button>

          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all">
            <Play size={14} /> Watch Demo
          </button>
        </div>
      </div>

      {/* 🛡️ RIGHT: Neural Shield Pulse */}
      <div className="relative flex justify-center items-center ">
        {/* Outer glow wave */}
        <motion.div
          className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30 blur-[80px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        {/* Shield shape */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-[200px] h-[220px] bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-400/30 rounded-[60%_60%_40%_40%/70%_70%_30%_30%] backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)]"
        >
          <div className="text-4xl">🧠</div>
          <p className="mt-2 text-sm text-cyan-300 font-semibold">
            AI Focus Core
          </p>
        </motion.div>

        {/* Inner pulse line */}
        <motion.div
          className="absolute w-[220px] h-[220px] rounded-full border border-cyan-400/30"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </section>
  );
}
