import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Riya K.",
      role: "Designer",
      text: "DopaGuard stopped my doomscrolling and gave me back 3 hours every day.",
      glow: "from-cyan-400/30 to-blue-500/30",
    },
    {
      name: "Arjun P.",
      role: "Student",
      text: "Focus Mode is pure magic. I actually finish my study sessions now.",
      glow: "from-purple-400/30 to-pink-500/30",
    },
    {
      name: "Neha S.",
      role: "Developer",
      text: "AI filtering feels invisible but powerful. My screen time dropped drastically.",
      glow: "from-blue-400/30 to-cyan-400/30",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Glow Aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center mb-14 relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          What Users Say
        </h2>
        <p className="text-white/70 mt-3 max-w-2xl mx-auto">
          Hear how DopaGuard transforms focus and reduces digital dopamine
          overload.
        </p>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="container grid md:grid-cols-3 gap-10 relative z-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: i * 0.2,
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.03,
              y: -5,
              transition: { type: "spring", stiffness: 200, damping: 14 },
            }}
            className={`relative group rounded-2xl p-[2px] bg-gradient-to-br ${t.glow} border border-white/10 shadow-[0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-xl`}
          >
            {/* Inner Card */}
            <div className="bg-gradient-to-b from-white/5 to-white/2 rounded-2xl p-8 h-full text-center flex flex-col justify-between">
              <Quote className="w-8 h-8 text-cyan-400/70 mx-auto mb-4" />
              <p className="text-white/80 italic mb-6 leading-relaxed">
                “{t.text}”
              </p>
              <div>
                <h4 className="font-semibold text-white">{t.name}</h4>
                <p className="text-white/50 text-sm">{t.role}</p>
              </div>
            </div>

            {/* Glow hover ring */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition duration-500 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"></div>
          </motion.div>
        ))}
      </div>

      {/* Floating Particle Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-full blur-[140px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
    </section>
  );
}
