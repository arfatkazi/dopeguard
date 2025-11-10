import React from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Brain, Crown } from "lucide-react";

export default function PricingSection() {
  const [currency, setCurrency] = React.useState("INR");

  // 💱 Currency Converter
  const convertPrice = (priceINR) => {
    if (currency === "USD") {
      const usdValue = (parseInt(priceINR.replace("₹", "")) / 83).toFixed(2);
      return `$${usdValue}`;
    }
    return priceINR;
  };

  // 💳 Stripe Checkout Handler
  const handleCheckout = async (planKey) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscription/create-session`,
        { plan: planKey },
        { withCredentials: true }
      );

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        alert("⚠️ Unable to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      alert("❌ Payment failed. Try again later.");
    }
  };

  // 🧠 Plans
  const plans = [
    {
      icon: <Zap size={28} className="text-cyan-400" />,
      title: "Monthly Starter",
      price: "₹199",
      desc: "Mindful dopamine tracking with core AI filters.",
      features: ["AI Image Filtering", "Focus Mode", "Basic Insights"],
      color: "from-cyan-500/30 to-blue-500/30",
      planKey: "STARTER",
    },
    {
      icon: <Brain size={28} className="text-blue-400" />,
      title: "3-Month Focus Pack",
      price: "₹499",
      desc: "Full DopeGuard experience for deep focus and discipline.",
      features: [
        "Adaptive AI Blocking",
        "Focus Mode+",
        "Weekly Progress",
        "Device Sync",
      ],
      color: "from-blue-500/30 to-indigo-500/30",
      planKey: "FOCUS_PACK",
    },
    {
      icon: <Shield size={28} className="text-indigo-400" />,
      title: "6-Month Growth Plan",
      price: "₹899",
      desc: "Build lasting focus habits with advanced AI analytics.",
      features: [
        "Behavior Tracking",
        "Extended Reports",
        "Priority Updates",
        "Smart Alerts",
      ],
      color: "from-indigo-500/30 to-purple-500/30",
      planKey: "GROWTH",
    },
    {
      icon: <Crown size={28} className="text-purple-400" />,
      title: "12-Month Elite Plan",
      price: "₹1499",
      desc: "Ultimate mastery with exclusive AI insights & upgrades.",
      features: [
        "All Pro Features",
        "AI Focus Insights",
        "Beta Access",
        "Priority Support",
      ],
      color: "from-purple-500/30 to-pink-500/30",
      planKey: "ELITE",
      bestValue: true,
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      {/* 🌌 Background Aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* 💱 Currency Toggle */}
      <div className="absolute top-6 right-10 z-20">
        <button
          onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
          className="bg-white/10 hover:bg-white/20 text-white/80 text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
        >
          Switch to {currency === "INR" ? "USD" : "INR"}
        </button>
      </div>

      {/* 🧠 Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Choose Your Focus Path
        </h2>
        <p className="text-white/70 mt-3 max-w-2xl mx-auto text-lg">
          Unlock your peak focus potential with adaptive AI and dopamine
          regulation technology.
        </p>
      </motion.div>

      {/* 💎 Pricing Cards */}
      <div className="container grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.05,
              y: -10,
              boxShadow: "0 0 50px rgba(6,182,212,0.15)",
            }}
            className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${plan.color} border border-white/10 backdrop-blur-xl overflow-hidden`}
          >
            <div
              className={`bg-gradient-to-b from-white/5 to-white/0 rounded-2xl p-8 h-full flex flex-col justify-between relative ${
                plan.bestValue
                  ? "ring-2 ring-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
                  : ""
              }`}
            >
              {/* ⭐ Best Value Badge */}
              {plan.bestValue && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-semibold text-white px-3 py-1 rounded-full shadow-md">
                  Best Value
                </div>
              )}

              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                {plan.icon}
                <h3 className="text-lg font-semibold text-white">
                  {plan.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-white/60 text-sm mb-4">{plan.desc}</p>

              {/* Price */}
              <h4 className="text-3xl font-extrabold text-cyan-400 mb-6">
                {convertPrice(plan.price)}
              </h4>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {plan.features.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-white/80 text-sm"
                  >
                    <Check className="w-4 h-4 text-cyan-400" /> {f}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: plan.bestValue
                    ? "0 0 25px rgba(168,85,247,0.4)"
                    : "0 0 10px rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCheckout(plan.planKey)}
                className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                  plan.bestValue
                    ? "bg-gradient-to-r from-purple-400 to-pink-400 text-black"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                {plan.bestValue ? "Get Elite Access" : "Select Plan"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🌈 Floating Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-full blur-[200px] opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
    </section>
  );
}
