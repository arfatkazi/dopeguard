import React from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Brain, Crown } from "lucide-react";

export default function PricingSection() {
  // ✅ Locked currency (INR only)
  const currency = "INR";

  // 💱 Price Display Helper
  const formatPrice = (priceINR) => priceINR;

  // 🔒 Global flag to prevent duplicate verification
  let paymentVerified = false;

  // 💳 Razorpay Checkout Handler
  const handlePayment = async (planKey) => {
    try {
      if (paymentVerified) {
        console.log("⚠️ Duplicate payment attempt blocked.");
        return;
      }

      console.log("🧠 Starting payment for plan:", planKey);

      // 1️⃣ Create Order on Backend
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-order`,
        { plan: planKey },
        { withCredentials: true }
      );

      console.log("📦 Order created:", data);

      if (!data.success || !data.order) {
        alert("❌ Failed to start payment. Please try again.");
        return;
      }

      // 2️⃣ Configure Razorpay Checkout
      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: currency, // ✅ Now properly using the variable
        name: "DopeGuard",
        description: `${planKey} Subscription`,
        order_id: data.order.id,
        theme: { color: "#00BFFF" },
        prefill: {
          name: "Focus User",
          email: "user@example.com",
        },

        // ✅ 3️⃣ On Payment Success
        handler: async (response) => {
          if (paymentVerified) {
            console.log("⚠️ Duplicate verification prevented.");
            return;
          }
          paymentVerified = true;

          console.log("🧾 Payment response:", response);

          const payload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: planKey,
          };

          if (!payload.razorpay_payment_id || !payload.razorpay_signature) {
            console.error("❌ Missing fields in Razorpay response:", payload);
            alert("Payment response incomplete. Please retry.");
            return;
          }

          console.log("📤 Verifying payment with payload:", payload);

          try {
            const verify = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/payment/verify-payment`,
              payload,
              { withCredentials: true }
            );

            console.log("✅ Verification response:", verify.data);

            if (verify.data.success) {
              localStorage.setItem("plan", planKey);
              localStorage.setItem("order_id", payload.razorpay_order_id);
              localStorage.setItem("amount", data.order.amount);

              window.location.href = `/success?plan=${planKey}&order_id=${payload.razorpay_order_id}&amount=${data.order.amount}`;
            } else {
              alert("⚠️ Payment verification failed: " + verify.data.message);
              window.location.href = "/payment-failed";
            }
          } catch (err) {
            console.error("❌ Verification error:", err);
            alert("Server error during verification. Try again later.");
            window.location.href = "/payment-failed";
          }
        },
      };

      // 4️⃣ Failure Event Handler
      const razor = new window.Razorpay(options);
      razor.on("payment.failed", (res) => {
        console.error("💥 Payment failed:", res.error);
        alert("❌ Payment failed. Please try again.");
        window.location.href = "/payment-failed";
      });

      razor.open();
    } catch (error) {
      console.error("💥 Payment error:", error);
      alert("⚠️ Something went wrong. Please try again.");
    }
  };

  // 🧩 Pricing Plans
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

      {/* 🧠 Section Header */}
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
              {plan.bestValue && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-semibold text-white px-3 py-1 rounded-full shadow-md">
                  Best Value
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                {plan.icon}
                <h3 className="text-lg font-semibold text-white">
                  {plan.title}
                </h3>
              </div>

              <p className="text-white/60 text-sm mb-4">{plan.desc}</p>

              <h4 className="text-3xl font-extrabold text-cyan-400 mb-6">
                {formatPrice(plan.price)}
              </h4>

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

              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: plan.bestValue
                    ? "0 0 25px rgba(168,85,247,0.4)"
                    : "0 0 10px rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handlePayment(plan.planKey)}
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
    </section>
  );
}
