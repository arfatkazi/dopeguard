import React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Zap, Eye, Lock, BarChart2 } from "lucide-react";

/**
 * ✨ Modern Premium Feature Cards
 * Elegant, restrained glow • Glassmorphism • Motion Depth
 */
export default function FeaturesSection() {
  const features = [
    {
      step: "1",
      title: "AI-based Detection",
      desc: "Detects NSFW or adult content Images and videos in real-time.",
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      glow: "from-cyan-400/25 to-blue-500/25",
    },
    {
      step: "2",
      title: "Instant Blocking",
      desc: "When detected, it immediately blacks out or hides the offending images/videos.",
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      glow: "from-indigo-400/25 to-purple-400/25",
    },
    {
      step: "3",
      title: "URL Monitoring",
      desc: "Automatically blocks those pages or overlays a “Focus Shield” on top.",
      icon: <Lock className="w-5 h-5 text-blue-400" />,
      glow: "from-blue-400/25 to-cyan-400/25",
    },
    {
      step: "4",
      title: "Self-Protection Mechanism",
      desc: "If someone tries to remove the script, disable it, or open DevTools, it auto-restarts itself to stay active.",
      icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
      glow: "from-purple-400/25 to-pink-400/25",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Soft background gradient blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Heading */}
      <div className="container relative z-10 text-center mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          How DopeGuard Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-white/70 max-w-2xl mx-auto"
        >
          Designed for modern minds. Smart dopamine regulation through adaptive
          AI.
        </motion.p>
      </div>

      {/* Feature Cards */}
      <div className="flex flex-wrap justify-center gap-10 perspective-1000">
        {features.map((f, i) => (
          <Feature3DCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------
   🌌 Feature Card Component
---------------------------------------- */
function Feature3DCard({ step, title, desc, icon, glow }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  // gentle floating baseline motion
  const floatY = useSpring(useMotionValue(0), {
    stiffness: 15,
    damping: 12,
    mass: 0.6,
  });

  function handleMouse(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xVal = e.clientX - rect.left - rect.width / 2;
    const yVal = e.clientY - rect.top - rect.height / 2;
    x.set(xVal);
    y.set(yVal);
  }

  function resetTilt() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      viewport={{ once: true }}
    >
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={resetTilt}
        style={{ rotateX, rotateY, y: floatY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="relative w-[280px] sm:w-[300px] md:w-[320px] h-[240px]
                   rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10
                   shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]
                   transition-all duration-300 group"
      >
        {/* Soft Gradient Glow Layer */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${glow}
                      opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-500`}
        ></div>

        {/* Inner Glass Layer */}
        <div
          className="absolute inset-[1px] rounded-2xl bg-gradient-to-br
                     from-white/10 to-white/5 border border-white/10 backdrop-blur-xl"
        ></div>

        {/* Content */}
        <div
          className="relative z-10 flex flex-col justify-center items-center text-center
                     h-full px-6 text-white"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 border border-white/10 shadow-inner shadow-cyan-400/10">
              {icon}
            </div>
            <span className="text-cyan-400 text-lg font-medium">
              STEP {step}
            </span>
          </div>

          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
        </div>

        {/* Light reflection shimmer */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-80"
          animate={{ y: ["100%", "-100%"] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
