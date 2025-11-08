import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, User, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Fade in sync with loader
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // Add glass shadow after scrolling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => setOpen(false), [location.pathname]);

  if (!visible) return null;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/pricing", label: "Pricing" },
    { to: "/contact", label: "Contact" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      {/* 🌐 Main Navbar */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-[90] transition-all duration-500 backdrop-blur-md ${
          scrolled
            ? "bg-black/60 shadow-[0_0_25px_rgba(6,182,212,0.25)] border-b border-white/10"
            : "bg-black/40"
        }`}
      >
        {/* Animated Gradient Line */}
        <motion.div
          className="absolute bottom-0 left-0 w-[200%] h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-40"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <div className="container flex items-center justify-between h-14 md:h-16 relative z-10">
          {/* 🔰 Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-md bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-white/10 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
              <Shield size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-sm md:text-base text-white group-hover:text-cyan-400 transition">
                DopeGuard
              </div>
              <div className="text-xs text-white/60 tracking-wide">
                AI Shield
              </div>
            </div>
          </Link>

          {/* 🧭 Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-2 py-1 text-sm font-medium group transition-all duration-200 ${
                    active ? "text-cyan-400" : "text-white/80 hover:text-white"
                  }`}
                >
                  {l.label}
                  <motion.span
                    layoutId="underline"
                    className={`absolute left-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* 💎 Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:bg-white/5 transition"
            >
              <User size={16} /> Sign in
            </button>

            <Link
              to="/pricing"
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold shadow-md hover:shadow-cyan-400/40 hover:scale-[1.04] transition-transform"
            >
              <ShoppingCart size={16} /> Get Focused
            </Link>
          </div>

          {/* 📱 Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* 📲 Mobile Sidebar Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 250, damping: 24 }}
              className="fixed inset-y-0 right-0 z-[95] w-[85%] max-w-sm bg-gradient-to-b from-[#060b17]/95 to-black/90 border-l border-white/10 backdrop-blur-2xl p-6 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  to="/"
                  className="flex items-center gap-3"
                  onClick={() => setOpen(false)}
                >
                  <div className="p-2 rounded-md bg-white/10">
                    <Shield size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">DopaGuard</div>
                    <div className="text-xs text-white/60">AI Shield</div>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-3">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-3 rounded-lg text-sm font-medium ${
                      location.pathname === l.to
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              {/* Buttons */}
              <div className="mt-6 border-t border-white/10 pt-5 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowAuth(true);
                    setOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
                >
                  <User size={16} /> Sign In
                </button>

                <Link
                  to="/pricing"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold hover:scale-[1.03] transition-transform"
                >
                  Get Focused — ₹99
                </Link>
              </div>

              <div className="mt-5 text-xs text-white/50 text-center">
                © {new Date().getFullYear()} DopeGuard
              </div>
            </motion.aside>

            {/* Overlay */}
            <motion.div
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[90] bg-black"
            />
          </>
        )}
      </AnimatePresence>

      {/* 💬 Auth Modal (popup) */}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
