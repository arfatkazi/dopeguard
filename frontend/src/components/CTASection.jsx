import React from "react";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden text-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl pointer-events-none" />

      {/* Pulsing Aura */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-purple-400/10 rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 container"
      >
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Take Back Control of Your Focus
        </h2>

        <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
          Join thousands reclaiming their attention with{" "}
          <span className="text-cyan-400 font-semibold">DopeGuard</span> — your
          AI-powered dopamine regulator.
        </p>

        <motion.a
          href="#"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 25px rgba(6,182,212,0.4)",
          }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold text-lg shadow-lg hover:shadow-cyan-400/40 transition-all"
        >
          <Chrome className="w-5 h-5" /> Add to Chrome
        </motion.a>

        <p className="text-white/50 text-sm mt-5">
          100% Private · No Sign-up Required · Always Free to Try
        </p>
      </motion.div>
    </section>
  );
}
