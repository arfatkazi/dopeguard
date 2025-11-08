import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 py-10 overflow-hidden">
      {/* Soft gradient glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl pointer-events-none" />

      {/* Subtle moving glow line */}
      <motion.div
        className="absolute top-0 left-0 w-[300%] h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-30"
        animate={{ x: ["0%", "-66%"] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Footer Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 text-center container"
      >
        <nav className="flex justify-center gap-6 mb-4 text-white/70 text-sm">
          <a href="/" className="hover:text-cyan-400 transition-colors">
            Home
          </a>
          <a href="/pricing" className="hover:text-cyan-400 transition-colors">
            Pricing
          </a>
          <a href="/contact" className="hover:text-cyan-400 transition-colors">
            Contact
          </a>
        </nav>

        <p className="text-white/50 text-sm">
          © {year}{" "}
          <span className="text-cyan-400 font-semibold">DopeGuard</span>. All
          rights reserved.
        </p>
      </motion.div>
    </footer>
  );
}
