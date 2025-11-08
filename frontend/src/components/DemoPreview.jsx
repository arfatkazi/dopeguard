import React from "react";
import { motion } from "framer-motion";
import { Brain, Eye, Lock, LineChart } from "lucide-react";

export default function DemoPreview() {
  const steps = [
    {
      title: "Neural Scan Layer",
      desc: "DopeGuard integrates TensorFlow.js and NSFW.js models to analyze every image and video frame on the websites you visit",
      icon: <Brain className="text-cyan-400 w-6 h-6" />,
      color: "from-cyan-500/20 to-blue-500/20",
    },
    {
      title: "Instant Content Neutralization",
      desc: "The filter operates continuously and silently, updating as new content loads or pages scroll.",
      icon: <Eye className="text-blue-400 w-6 h-6" />,
      color: "from-blue-400/20 to-indigo-500/20",
    },
    {
      title: "Domain & URL Filtering",
      desc: "A lightweight URL monitor runs in parallel, scanning web addresses for adult or addictive platforms.",
      icon: <Lock className="text-indigo-400 w-6 h-6" />,
      color: "from-indigo-500/20 to-purple-500/20",
    },
    {
      title: "Tamper-Resistant Engine",
      desc: "This ensures your AI shield stays active at all times — even against manual interference.",
      icon: <LineChart className="text-purple-400 w-6 h-6" />,
      color: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* 🌌 Background aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent blur-3xl opacity-60 pointer-events-none" />

      {/* 🌊 Infinite left-flowing gradient line */}
      <motion.div
        className="absolute bottom-[15%] left-0 w-[300%] h-[4px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-40 blur-[6px]"
        animate={{ x: ["0%", "-66%"] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ✨ Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          How DopeGuard Operates
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto mt-3">
          DopeGuard functions as an AI-powered visual firewall that filters
          dopamine-triggering and NSFW content in real time — directly inside
          your browser
        </p>
      </motion.div>

      {/* 🧠 Step Cards */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 container">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              ease: "easeOut",
            }}
            className={`relative flex flex-col items-center text-center rounded-2xl p-[2px] bg-gradient-to-br ${s.color} border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.1)] w-full lg:w-[22%] min-h-[260px]`}
          >
            {/* Inner Card */}
            <div className="flex flex-col flex-1 justify-center items-center bg-gradient-to-b from-white/5 to-white/2 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/10 mb-4 shadow-inner">
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">{s.desc}</p>
            </div>

            {/* Connector line (only desktop) */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 right-[-60px] w-[120px] h-[2px] bg-gradient-to-r from-cyan-400/50 to-blue-400/20" />
            )}
          </motion.div>
        ))}
      </div>

      {/* 🌐 Subtle background pulse orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-full blur-[160px] opacity-40 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
    </section>
  );
}
