import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield } from "lucide-react";

const faqs = [
  {
    question: "What is DopeGuard?",
    answer:
      "DopeGuard is an AI-powered browser extension that detects and blocks NSFW or dopamine-triggering visuals in real time. It uses deep learning (TensorFlow.js + NSFW.js) to identify explicit or distracting content and hide it before you even see it — helping you stay focused and mentally clean online.",
  },
  {
    question: "How does DopeGuard actually work?",
    answer:
      "It runs locally inside your browser using TensorFlow.js. The AI scans images and videos on webpages — if it detects adult or addictive visuals, it blurs or blocks them instantly. Everything happens offline, with no cloud access or tracking.",
  },
  {
    question: "Which browsers and systems are supported?",
    answer:
      "DopeGuard works with all Chromium-based browsers (Chrome, Brave, Edge, Opera) and runs smoothly on Windows, macOS, and Linux — anywhere Chrome can run, DopeGuard works.",
  },
  {
    question: "Does DopeGuard collect my personal data?",
    answer:
      "No. All content detection happens locally on your device. DopeGuard never uploads your browsing data or media to the cloud. Your privacy is 100% preserved.",
  },
  {
    question: "Can DopeGuard block entire websites?",
    answer:
      "Yes. It includes a smart domain filter that automatically blocks adult or addictive platforms and replaces them with a calming Focus Shield interface to help you stay on track.",
  },
  {
    question: "Does DopeGuard slow down my browser?",
    answer:
      "Not at all. The AI model is lightweight and runs on your GPU. DopeGuard only analyzes visible content, ensuring your browsing stays smooth and fast.",
  },
  {
    question: "Can I customize what content gets blocked?",
    answer:
      "Soon! Upcoming updates will include advanced category filters — so you can choose to block NSFW, violent, or addictive visuals independently and enable different Focus Modes.",
  },
  {
    question: "Does DopeGuard work offline?",
    answer:
      "Yes. Once installed, the AI model runs entirely offline using your browser’s TensorFlow runtime — no internet connection is needed for detection.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) =>
    setActiveIndex(activeIndex === index ? null : index);

  return (
    <section className="relative py-20 bg-[#0a0f1f] text-white">
      {/* 🌌 Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[180px] opacity-60 pointer-events-none" />

      <div className="container relative z-10">
        {/* 🧠 Header */}
        <div className="text-center mb-14">
          <div className="flex justify-center mb-4">
            <Shield size={32} className="text-cyan-400" />
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-white/70 mt-3">
            Everything you need to know about how DopeGuard protects your focus.
          </p>
        </div>

        {/* ⚡ FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-white/10 transition-colors"
                >
                  <span className="text-base md:text-lg font-medium text-white/90">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <ChevronDown
                      size={22}
                      className="text-cyan-400 transition-transform"
                    />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="content"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className="px-5 pb-4 text-white/70 text-sm md:text-base pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
