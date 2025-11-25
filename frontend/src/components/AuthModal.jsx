import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

/* ======================================================
   🌐 Global Axios Configuration (Cookie + Base URL)
====================================================== */

// Always send cookies (重要 for JWT)
axios.defaults.withCredentials = true;

// Base URL for all callers
axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState("signin");

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
          {/* Close button */}
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
              Log In
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/login", {
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login Successful!");
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }

    setLoading(false);
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
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="relative">
        <input
          type={showPass ? "text" : "password"}
          placeholder="Password"
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-black/90 cursor-pointer"
        >
          {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* ⬇⬇ ADDING FORGOT PASSWORD LINK HERE ⬇⬇ */}
      <p
        className="text-sm text-cyan-400 text-right mt-1 cursor-pointer hover:text-cyan-300"
        onClick={() => {
          window.location.href = "/forgot-password";
        }}
      >
        Forgot Password?
      </p>
      {/* ⬆⬆ END OF INSERTED SECTION ⬆⬆ */}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold rounded-xl disabled:opacity-60"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </motion.form>
  );
}

/* ------------------------------------------------
   SIGN UP
------------------------------------------------ */
function SignUpForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/register", form);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Account Created!");
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed, try again"
      );
    }

    setLoading(false);
  };

  return (
    <motion.form
      key="signup"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
      onSubmit={submit}
    >
      <input
        type="text"
        placeholder="Full Name"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <div className="relative">
        <input
          type={showPass ? "text" : "password"}
          placeholder="Create Password"
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-black/90 cursor-pointer"
        >
          {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold rounded-xl disabled:opacity-60"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </motion.form>
  );
}
