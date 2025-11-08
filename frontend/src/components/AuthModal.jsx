import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"

  // Close with ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 w-[90%] max-w-md text-white shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ❌ Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-md bg-white/10 hover:bg-white/20"
          >
            <X size={18} />
          </button>

          {/* Tabs */}
          <div className="flex justify-center mb-6 border-b border-white/10">
            <button
              className={`px-4 py-2 font-medium ${
                mode === "signin"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                mode === "signup"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Form content */}
          {mode === "signin" ? <SignInForm /> : <SignUpForm />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------
   SIGN IN FORM
------------------------------------------------ */
function SignInForm() {
  return (
    <motion.form
      key="signin"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold rounded-xl hover:shadow-cyan-400/40 transition-all"
      >
        Sign In
      </button>
      <p className="text-xs text-center text-white/50 mt-2">
        Forgot password?{" "}
        <span className="text-cyan-400 cursor-pointer hover:underline">
          Reset
        </span>
      </p>
    </motion.form>
  );
}

/* ------------------------------------------------
   SIGN UP FORM
------------------------------------------------ */
function SignUpForm() {
  return (
    <motion.form
      key="signup"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <input
        type="text"
        placeholder="Full Name"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <input
        type="password"
        placeholder="Create Password"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold rounded-xl hover:shadow-cyan-400/40 transition-all"
      >
        Create Account
      </button>
      <p className="text-xs text-center text-white/50 mt-2">
        Already have an account?{" "}
        <span className="text-cyan-400 cursor-pointer hover:underline">
          Sign In
        </span>
      </p>
    </motion.form>
  );
}
