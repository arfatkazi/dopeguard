import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, MessageSquare, User, Shield } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const send = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      // ⚙️ Replace with your backend endpoint
      await axios.post("/api/contact", form);
      setStatus("✅ Message sent successfully — thank you!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("❌ Unable to send message. Try again later.");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050913] text-white overflow-hidden pt-24 pb-16">
      {/* 🌌 Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[180px] opacity-60 pointer-events-none" />

      <section className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Shield size={36} className="text-cyan-400" />
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto text-lg">
            Have feedback, feature requests, or partnership ideas? We’d love to
            hear from you.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          onSubmit={send}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl mx-auto grid gap-5 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        >
          {/* Name */}
          <div className="relative">
            <User
              size={18}
              className="absolute top-3.5 left-3 text-cyan-400/60 pointer-events-none"
            />
            <input
              className="w-full pl-10 p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/40 focus:border-cyan-400 outline-none transition-all"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute top-3.5 left-3 text-cyan-400/60 pointer-events-none"
            />
            <input
              type="email"
              className="w-full pl-10 p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/40 focus:border-cyan-400 outline-none transition-all"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Message */}
          <div className="relative">
            <MessageSquare
              size={18}
              className="absolute top-3 left-3 text-cyan-400/60 pointer-events-none"
            />
            <textarea
              rows={6}
              className="w-full pl-10 p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/40 focus:border-cyan-400 outline-none transition-all resize-none"
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold shadow-lg hover:shadow-cyan-400/40 transition-all"
          >
            Send Message
          </motion.button>

          {/* Status Message */}
          {status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/70 mt-3"
            >
              {status}
            </motion.div>
          )}
        </motion.form>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12 text-white/60 text-sm"
        >
          <p>📧 support@dopaguard.ai</p>
          <p className="mt-1">🌍 Available for Windows • macOS • Linux</p>
        </motion.div>
      </section>
    </main>
  );
}
