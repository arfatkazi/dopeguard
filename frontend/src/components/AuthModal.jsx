import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

/* ======================================================
   🌐 Global Axios Configuration
====================================================== */
axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState("signin");

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-md bg-white/10 hover:bg-white/20"
          >
            <X size={18} />
          </button>

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

/* ---------------- LOGIN ---------------- */

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/login", { email, password });

      if (!data.success) {
        toast.error(data.message);
        setLoading(false);
        return;
      }

      /** NEW fixed logic */
      await axios
        .get("/api/auth/verify")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("user");
        });

      toast.success("Logged in!");

      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      onSubmit={handleLogin}
    >
      <input
        required
        type="email"
        placeholder="Email"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative">
        <input
          required
          type={showPass ? "text" : "password"}
          placeholder="Password"
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
        >
          {showPass ? <Eye /> : <EyeOff />}
        </button>
      </div>

      <p
        className="text-sm text-cyan-400 text-right cursor-pointer"
        onClick={() => (window.location.href = "/forgot-password")}
      >
        Forgot password?
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black rounded-xl"
      >
        {loading ? "..." : "Sign In"}
      </button>
    </motion.form>
  );
}

/* ---------------- SIGNUP ---------------- */

function SignUpForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/register", form);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      /** NEW Fixed logic */
      await axios
        .get("/api/auth/verify")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("user");
        });

      toast.success("Welcome!");

      window.location.href = "/";
    } catch (err) {
      toast.error("Registration failed");
    }

    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      onSubmit={submit}
    >
      <input
        required
        type="text"
        placeholder="Full name"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        required
        type="email"
        placeholder="Email"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <div className="relative">
        <input
          required
          type={showPass ? "text" : "password"}
          placeholder="Password"
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
        >
          {showPass ? <Eye /> : <EyeOff />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-black rounded-xl"
      >
        {loading ? "..." : "Create Account"}
      </button>
    </motion.form>
  );
}
