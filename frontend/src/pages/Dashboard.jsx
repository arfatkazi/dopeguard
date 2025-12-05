import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActivityCard from "../components/ActivityCard";
import DevicesList from "../components/DevicesList";
import WeeklyFocusChart from "../components/WeeklyFocusChart";
import BlockedSitesList from "../components/BlockedSitesList";
import {
  fetchActivities,
  fetchWeeklyStats,
  fetchBlockedSites,
  fetchDevices,
  fetchDopamineSpikes,
} from "../services/analyticsService.js";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [devices, setDevices] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [blockedSites, setBlockedSites] = useState([]);
  const [dopamine, setDopamine] = useState({ spikes: [], threshold: 3 });

  // 🧠 Always fetch latest backend data (fix for Phase 5)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`,
          { withCredentials: true }
        );

        if (data.success) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user)); // sync
        }
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // useEffect to load data (after verifying user)
  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, wRes, bRes, dRes, devRes] = await Promise.allSettled([
          fetchActivities({ limit: 20 }),
          fetchWeeklyStats(),
          fetchBlockedSites(8),
          fetchDopamineSpikes(),
          fetchDevices(),
        ]);

        if (aRes.status === "fulfilled" && aRes.value.data.success) {
          setActivities(aRes.value.data.activities || []);
        }
        if (wRes.status === "fulfilled" && wRes.value.data.success) {
          setWeeklyData(wRes.value.data.weekly || []);
        }
        if (bRes.status === "fulfilled" && bRes.value.data.success) {
          setBlockedSites(bRes.value.data.sites || []);
        }
        if (dRes.status === "fulfilled" && dRes.value.data.success) {
          setDopamine(dRes.value.data || { spikes: [], threshold: 3 });
          setDopamine(dRes.value.data);
        }
        if (devRes.status === "fulfilled" && devRes.value.data.success) {
          setDevices(devRes.value.data.devices || []);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    if (user) load();
  }, [user]);

  // 🛑 Detect ACTIVE status using backend expiry
  const isActive =
    user?.subscriptionStatus === "active" &&
    user?.planExpiry &&
    new Date(user.planExpiry) > new Date();

  // 🚨 Redirect only **after** loading is done
  useEffect(() => {
    if (!loading && user) {
      const expired =
        user.subscriptionStatus !== "active" ||
        !user.planExpiry ||
        new Date(user.planExpiry) <= new Date();

      if (expired) {
        navigate("/upgrade?expired=true");
      }
    }
  }, [loading, user, navigate]);

  const handleManageBilling = () => navigate("/upgrade");

  return (
    <main className="relative min-h-screen bg-[#050913] text-white pt-24 pb-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-[180px] opacity-60 pointer-events-none" />

      <section className="container relative z-10">
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
            👋
          </p>

          {user && (
            <p className="mt-2 text-lg">
              Status:{" "}
              <span
                className={`px-3 py-1 rounded-lg font-semibold ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </p>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Focus Insights */}
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
              Weekly Focus:{" "}
              <span className="text-cyan-400 font-semibold">6h 22m</span>
            </p>
          </motion.div>

          {/* Shield Status */}
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

            <p className="text-white/80">
              AI Shield:{" "}
              <span className="font-semibold">
                {isActive ? "🟢 Active" : "🔴 Inactive"}
              </span>
            </p>
          </motion.div>

          {/* Subscription Card */}
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
              <p className="text-white/60">Loading...</p>
            ) : user ? (
              <>
                <p className="text-white/70">
                  Plan:{" "}
                  <span className="text-cyan-400">
                    {user.plan || "Free User"}
                  </span>
                </p>
                <p className="text-white/70 mb-3">
                  Expiry:{" "}
                  <span className="text-white">
                    {user.planExpiry
                      ? new Date(user.planExpiry).toLocaleDateString()
                      : "N/A"}
                  </span>
                </p>

                {!isActive && (
                  <button
                    onClick={handleManageBilling}
                    className="px-5 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
                  >
                    Renew Plan
                  </button>
                )}
              </>
            ) : (
              <p className="text-white/60">No user found</p>
            )}
          </motion.div>

          {/* Focus Trend */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="md:col-span-2 rounded-2xl bg-gradient-to-b from-white/5 to-white/0 border border-white/10 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)]"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Focus Trend (Beta)
            </h3>
            <p className="text-white/60 text-sm">
              Advanced insights coming soon.
            </p>
          </motion.div>
        </div>

        {/* Weekly chart + blocked sites */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <WeeklyFocusChart
            data={weeklyData.map((r) => ({
              ...r,
              focusTime: Math.round(r.focusTime),
            }))}
          />
          <BlockedSitesList sites={blockedSites} />
        </div>

        {/* Recent activity */}
        <section className="mt-8">
          <h3 className="text-white/90 font-semibold mb-4">Recent activity</h3>
          <div className="space-y-3">
            {activities.length === 0 && (
              <div className="text-white/60">No activity yet</div>
            )}
            {activities
              .flatMap((a) => a.details || [])
              .slice(0, 20)
              .map((it, idx) => (
                <ActivityCard key={idx} item={it} />
              ))}
          </div>
        </section>

        {/* Devices */}
        <section className="mt-8 md:mt-12">
          <h3 className="text-white/90 font-semibold mb-4">Devices</h3>
          <DevicesList
            devices={devices}
            onRefresh={() => {
              /* optionally refetch devices */
            }}
          />
        </section>
      </section>
    </main>
  );
}
