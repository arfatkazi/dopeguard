import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Brain, Shield, Crown } from "lucide-react";
import { initiateRazorpayPayment } from "../utils/razorpay";

export default function PricingSection() {
  const plans = [
    {
      icon: <Zap size={28} className="text-cyan-400" />,
      title: "Monthly Starter",
      price: "₹199",
      planKey: "STARTER",
      color: "from-cyan-500/30 to-blue-500/30",
      features: ["AI Image Filtering", "Focus Mode", "Basic Insights"],
    },
    {
      icon: <Brain size={28} className="text-blue-400" />,
      title: "3-Month Focus Pack",
      price: "₹499",
      planKey: "FOCUS_PACK",
      color: "from-blue-500/30 to-indigo-500/30",
      features: [
        "Adaptive AI Blocking",
        "Focus Mode+",
        "Weekly Progress",
        "Device Sync",
      ],
    },
    {
      icon: <Shield size={28} className="text-indigo-400" />,
      title: "6-Month Growth Plan",
      price: "₹899",
      planKey: "GROWTH",
      color: "from-indigo-500/30 to-purple-500/30",
      features: [
        "Behavior Tracking",
        "Extended Reports",
        "Priority Updates",
        "Smart Alerts",
      ],
    },
    {
      icon: <Crown size={28} className="text-purple-400" />,
      title: "12-Month Elite Plan",
      price: "₹1499",
      planKey: "ELITE",
      color: "from-purple-500/30 to-pink-500/30",
      bestValue: true,
      features: [
        "All Pro Features",
        "AI Focus Insights",
        "Beta Access",
        "Priority Support",
      ],
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden -m-35 ">
      <motion.div
        className="text-center mb-16 relative z-10"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Choose Your Focus Path
        </h2>
        <p className="text-white/70 mt-3 max-w-2xl mx-auto text-lg">
          Unlock your peak focus potential with adaptive AI and dopamine
          regulation technology.
        </p>
      </motion.div>

      <div className="container grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${plan.color} border border-white/10 backdrop-blur-xl`}
          >
            <div className="bg-gradient-to-b from-white/5 to-white/0 rounded-2xl p-8 h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                {plan.icon}
                <h3 className="text-lg font-semibold text-white">
                  {plan.title}
                </h3>
              </div>

              <p className="text-white/60 text-sm mb-4">
                {plan.features.join(", ")}
              </p>

              <h4 className="text-3xl font-extrabold text-cyan-400 mb-6">
                {plan.price}
              </h4>

              <motion.button
                onClick={() => initiateRazorpayPayment(plan.planKey)}
                whileHover={{ scale: 1.05 }}
                className={`w-full py-2.5 rounded-xl font-semibold ${
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
    </section>
  );
}
