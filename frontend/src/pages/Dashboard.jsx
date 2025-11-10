import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, Crown, Settings } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`,
          { withCredentials: true }
        );
        setUser(data.user);
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 💳 Open Stripe Billing Portal
  const handleManageBilling = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscription/billing-portal`,
        { withCredentials: true }
      );
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Billing portal error:", error);
      alert("❌ Could not open billing portal. Try again later.");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050913] text-white pt-24 pb-20 overflow-hidden">
      {/* 🌌 Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[180px] opacity-60 pointer-events-none" />

      <section className="container relative z-10">
        {/* 🧠 Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <Shield size={42} className="text-cyan-400 mx-auto mb-4" />
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            DopeGuard Dashboard
          </h2>
          <p className="text-white/70 mt-3">
            Welcome back,{" "}
            <span className="text-cyan-400 font-semibold">Focus Warrior</span>{" "}
            👋 Your AI Shield is currently{" "}
            <span className="text-green-400 font-semibold">Active</span>.
          </p>
        </motion.div>

        {/* 🧩 Main Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 🧠 Focus Insights */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Focus Insights
              </h3>
              <BarChart3 size={20} className="text-cyan-400" />
            </div>
            <p className="text-white/70 mb-4">
              This week:{" "}
              <span className="text-cyan-400 font-semibold">6h 22m</span>{" "}
              distraction-free.
            </p>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[75%] rounded-full" />
            </div>
            <p className="text-xs text-white/50 mt-2">Goal: 8h / week</p>
          </motion.div>

          {/* 🛡️ Active Shield */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Shield Status
              </h3>
              <Zap size={20} className="text-cyan-400" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-white/80">
                AI Shield:{" "}
                <span className="text-green-400 font-semibold">Active</span>
              </p>
            </div>
            <p className="text-white/60 text-sm">
              Last scan blocked{" "}
              <span className="text-cyan-400 font-medium">12 NSFW visuals</span>{" "}
              and{" "}
              <span className="text-cyan-400 font-medium">
                3 dopamine triggers
              </span>
              .
            </p>
          </motion.div>

          {/* 💎 Subscription Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Subscription</h3>
              <Crown size={20} className="text-yellow-400" />
            </div>

            {loading ? (
              <p className="text-white/60">Loading plan...</p>
            ) : user ? (
              <>
                <p className="text-white/70">
                  Plan:{" "}
                  <span
                    className={`font-medium ${
                      user.plan === "ELITE"
                        ? "text-yellow-400"
                        : user.plan === "GROWTH"
                        ? "text-purple-400"
                        : user.plan === "FOCUS_PACK"
                        ? "text-cyan-400"
                        : "text-white/60"
                    }`}
                  >
                    {user.plan}
                  </span>
                </p>
                <p className="text-white/70 mb-4">
                  Expiry:{" "}
                  <span className="text-white">
                    {user.planExpiry
                      ? new Date(user.planExpiry).toLocaleDateString()
                      : "N/A"}
                  </span>
                </p>
                <button
                  onClick={handleManageBilling}
                  className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold transition-all"
                >
                  Manage Plan
                </button>
              </>
            ) : (
              <p className="text-white/60">No user data found</p>
            )}
          </motion.div>

          {/* 📈 Focus Trend (Beta) */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="md:col-span-2 rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Focus Trend (Beta)
              </h3>
              <Settings size={20} className="text-cyan-400" />
            </div>
            <p className="text-white/60 text-sm mb-4">
              Coming soon — view your weekly dopamine resistance and focus stats
              in detail.
            </p>
            <div className="w-full h-24 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40">
              Focus Analytics Graph Placeholder
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🧾 Footer */}
      <div className="text-center text-white/40 text-sm mt-12">
        © {new Date().getFullYear()} DopeGuard — Stay Clean. Stay Focused.
      </div>
    </main>
  );
}
