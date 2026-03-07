// src/components/FeatureCard.jsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * FeatureCard — DopaGuard / SocialCleanAI Style
 * 3D lift + glass blur + cyan/indigo glow aura
 */
export default function FeatureCard({
  title,
  desc,
  icon = null,
  highlight = false,
}) {
  const prefersReduced = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const hoverAnimation = prefersReduced
    ? {}
    : {
        y: -10,
        scale: 1.03,
        rotateX: -3,
        rotateY: 3,
        transition: { type: "spring", stiffness: 250, damping: 18 },
      };

  return (
    <motion.article
      role="article"
      aria-label={title}
      initial="hidden"
      whileInView="enter"
      viewport={{ once: true, amount: 0.25 }}
      variants={cardVariants}
      whileHover={hoverAnimation}
      whileTap={!prefersReduced ? { scale: 0.99 } : {}}
      className={`group relative overflow-hidden rounded-2xl p-5 backdrop-blur-md border border-white/10 bg-white/5 shadow-[0_8px_30px_rgba(2,6,23,0.4)] cursor-default transition-all duration-300 will-change-transform`}
      data-highlight={highlight ? "true" : "false"}
    >
      {/* ✨ Neon glow aura */}
      <div
        className={`absolute inset-0 z-[-1] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${
          highlight
            ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20"
            : "bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"
        }`}
      />

      {/* Reflection strip */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-40" />

      {/* Card content */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 border border-white/10 shadow-inner shadow-cyan-400/10">
          {icon ? (
            <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              {icon}
            </div>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-90"
            >
              <path
                d="M12 2v6M12 16v6M4 10h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 text-left">
          <h4 className="text-white text-base font-semibold mb-1">{title}</h4>
          <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute right-4 top-4 text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10">
        Live
      </div>

      {/* Animated glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-transparent pointer-events-none"
        animate={{
          boxShadow: highlight
            ? "0 0 22px rgba(6,182,212,0.35)"
            : "0 0 16px rgba(6,182,212,0.2)",
        }}
        transition={{ duration: 1.4, repeat: Infinity, repeatType: "mirror" }}
      />
    </motion.article>
  );
}
