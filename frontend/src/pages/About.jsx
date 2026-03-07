import React from "react";
import { motion } from "framer-motion";
import { Shield, Brain, Eye, Lock, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="pt-24 bg-[#050913] text-white relative overflow-hidden min-h-screen">
      {/* 🌌 Background Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1120] via-[#050913] to-[#040810]" />
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 blur-[220px] opacity-50 pointer-events-none" />

      {/* 🧠 Hero Section */}
      <section className="container relative z-10 grid md:grid-cols-2 items-center gap-12 py-24">
        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Reclaim Your Mind in the Age of Distraction
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            DopeGuard is an AI-powered browser extension designed to help you
            take back control from dopamine-driven distractions. It filters
            NSFW, addictive, and overstimulating visuals before they appear —
            keeping your digital environment clean, calm, and focus-friendly.
          </p>
          <div className="flex justify-center md:justify-start">
            <a
              href="/pricing"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 text-white font-semibold shadow-lg hover:shadow-cyan-400/40 hover:scale-[1.03] transition-all"
            >
              Try DopeGuard Now
            </a>
          </div>
        </motion.div>

        {/* Visual Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative flex justify-center items-center"
        >
          <div className="relative w-[340px] h-[340px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl animate-pulse-slow"></div>
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="absolute w-[240px] h-[240px] border-2 border-transparent rounded-full border-t-cyan-400 border-b-blue-400 opacity-60"
          ></motion.div>
          <Shield
            size={60}
            className="absolute text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
          />
        </motion.div>
      </section>

      {/* 🌍 The Story */}
      <section className="container relative z-10 py-24 text-center max-w-4xl mx-auto">
        <Sparkles
          size={32}
          className="text-cyan-400 mx-auto mb-4 animate-pulse"
        />
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          The Idea Behind DopeGuard
        </h2>
        <p className="text-white/70 text-lg leading-relaxed">
          The human brain isn’t built for infinite stimulation. Every scroll,
          every reel, every flash of color spikes your dopamine, reducing your
          natural focus over time. DopeGuard was born from this realization — to
          build a layer of AI that defends your mind instead of exploiting it.
        </p>
      </section>

      {/* 🔰 Core Features */}
      <section className="container relative z-10 py-20 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <Lock size={34} className="text-cyan-400 mb-3" />,
            title: "Private & Local",
            text: "All detection runs directly in your browser using TensorFlow.js. Your data never leaves your system.",
          },
          {
            icon: <Brain size={34} className="text-cyan-400 mb-3" />,
            title: "AI-Powered Detection",
            text: "Real-time on-device analysis blocks NSFW and dopamine-heavy visuals before your brain registers them.",
          },
          {
            icon: <Eye size={34} className="text-cyan-400 mb-3" />,
            title: "Calm Focus Mode",
            text: "Blocks or replaces entire websites known for overstimulation, turning your browser into a clean workspace.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(6,182,212,0.25)",
            }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-md"
          >
            {f.icon}
            <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
            <p className="text-white/70 text-sm leading-relaxed">{f.text}</p>
          </motion.div>
        ))}
      </section>

      {/* 🧩 Timeline */}
      <section className="container relative z-10 py-24 max-w-3xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-cyan-400">
          How DopeGuard Evolved
        </h3>
        <div className="space-y-8 border-l border-white/10 pl-6 relative">
          {[
            {
              year: "2023",
              title: "The Problem",
              text: "Recognized how dopamine-driven content and adult media eroded attention, focus, and mental balance.",
            },
            {
              year: "2024",
              title: "The Creation",
              text: "Developed DopeGuard — an AI-based browser extension using TensorFlow.js and NSFW.js for real-time blocking.",
            },
            {
              year: "2025",
              title: "The Expansion",
              text: "Optimized for all major platforms — Windows, macOS, Linux — ensuring fast local performance with zero data tracking.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative pl-4"
            >
              <div className="absolute -left-[10px] top-2 w-3 h-3 rounded-full bg-cyan-400" />
              <h4 className="text-lg font-semibold text-white">{item.year}</h4>
              <h5 className="text-cyan-400 font-medium mb-1">{item.title}</h5>
              <p className="text-white/60 text-sm leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✨ Footer */}
      <footer className="text-center text-white/50 py-10 text-sm border-t border-white/10 backdrop-blur-sm">
        © {new Date().getFullYear()} DopeGuard — Built for Clean Focus.
      </footer>
    </div>
  );
}
