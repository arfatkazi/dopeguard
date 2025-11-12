import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ======================================================
   🌐 Global Axios Configuration (Cookie + Base URL)
====================================================== */

// ✅ Always send cookies (important for JWT via cookies)
axios.defaults.withCredentials = true;

// ✅ Ensure consistent backend URL (so you don’t repeat it everywhere)
axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"

  // Close modal with ESC key
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
          {mode === "signin" ? (
            <SignInForm onClose={onClose} />
          ) : (
            <SignUpForm onClose={onClose} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------
   SIGN IN FORM
------------------------------------------------ */
function SignInForm({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("✅ Login successful!");
        console.log("Cookies after login:", document.cookie);
        window.location.reload();
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      alert(err.response?.data?.message || "❌ Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="signin"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
      onSubmit={handleLogin}
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold rounded-xl hover:shadow-cyan-400/40 transition-all disabled:opacity-60"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </motion.form>
  );
}

/* ------------------------------------------------
   SIGN UP FORM
------------------------------------------------ */
function SignUpForm({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", form);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("🎉 Account created successfully!");
        console.log("Cookies after register:", document.cookie);
        window.location.reload();
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          "❌ Registration failed. Try different email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="signup"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
      onSubmit={handleRegister}
    >
      <input
        type="text"
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <input
        type="password"
        placeholder="Create Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold rounded-xl hover:shadow-cyan-400/40 transition-all disabled:opacity-60"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </motion.form>
  );
}
