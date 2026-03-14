import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import "./App.css";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import PaymentFailed from "./pages/PaymentFailed";
import Success from "./pages/Success";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Upgrade from "./pages/Upgrade.jsx";

axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/* ⚙️ Neural Boot Loader */
function Loader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050b18] text-white"
    >
      <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[200px] opacity-70 animate-pulse" />
      <motion.h2
        className="relative z-10 text-xl md:text-2xl font-semibold text-white/90 tracking-wider"
        animate={{
          opacity: [0.8, 1, 0.8],
          letterSpacing: ["0.05em", "0.08em", "0.05em"],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Initializing Focus Protocols...
      </motion.h2>
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-4 h-[3px] w-[180px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"
      />
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const lenis = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);

  /* Restore session from Cookie JWT automatically */
  useEffect(() => {
    axios
      .get("/api/auth/verify", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      });
  }, []);

  // initialize smooth scroll
  useEffect(() => {
    if (!lenis.current) {
      const l = new Lenis({
        duration: 0.7,
        easing: (t) => t,
        smoothWheel: true,
        smoothTouch: false,
      });
      lenis.current = l;

      function raf(time) {
        l.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    const timer = setTimeout(() => setIsLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // scroll top on route change
  useEffect(() => {
    if (lenis.current) {
      lenis.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (!isLoaded) return <Loader />;

  return (
    <div className="min-h-screen flex flex-col bg-[#050b18] text-white overflow-hidden">
      <Navbar />

      {/* Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 pt-16 overflow-x-hidden"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/success" element={<Success />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/upgrade" element={<Upgrade />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
