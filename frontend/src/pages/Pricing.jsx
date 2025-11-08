import React, { useEffect } from "react";
import { motion } from "framer-motion";
import PricingSection from "../components/PricingSection";
import { Zap } from "lucide-react";

export default function Pricing() {
  // 👇 Scroll to top when this route loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-[#050913] text-white relative overflow-hidden">
      {/* 🌌 Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[180px] opacity-50 pointer-events-none" />

      {/* 🔹 Header Section */}
      <section className="relative z-10 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Tiny Label */}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Zap size={16} className="text-cyan-400" />
            <span className="text-sm text-white/70 font-medium tracking-wide">
              Boost Your Focus Energy
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            DopeGuard Plans
          </h1>

          {/* Animated underline glow */}
          <motion.div
            initial={{ width: 0, opacity: 0.3 }}
            animate={{ width: ["0%", "80%", "0%"], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto h-[2px] bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mb-6"
          />

          {/* Subtitle */}
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose the perfect plan for your focus journey — from mindful
            starter to elite mastery. Every tier is built to protect your
            attention and enhance your productivity.
          </p>
        </motion.div>
      </section>

      {/* 💎 Pricing Cards Section */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PricingSection />
      </motion.div>

      {/* 🌙 Footer Note */}
      <motion.div
        className="text-center py-10 text-white/40 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Focus. Discipline. Control. — Your attention deserves protection.
      </motion.div>
    </main>
  );
}
