import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Success() {
  const [params] = useSearchParams();
  const [details, setDetails] = useState({
    plan: "",
    orderId: "",
    amount: "",
    expiry: "",
    verified: true,
  });

  useEffect(() => {
    const plan = params.get("plan") || localStorage.getItem("plan");
    const orderId = params.get("order_id") || localStorage.getItem("order_id");
    const amount = params.get("amount") || localStorage.getItem("amount");

    if (plan && orderId && amount) {
      // Estimate expiry (fallback)
      const durationMap = {
        STARTER: 30,
        FOCUS_PACK: 90,
        GROWTH: 180,
        ELITE: 365,
      };
      const days = durationMap[plan] || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      setDetails({
        plan,
        orderId,
        amount: `₹${(Number(amount) / 100).toFixed(2)}`,
        expiry: expiryDate.toLocaleDateString(),
        verified: true,
      });
    }
  }, [params]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center bg-[#050913] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)]"
      >
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Payment Successful 🎉
        </h1>

        <p className="text-white/70 mb-6">
          Your{" "}
          <span className="text-cyan-400 font-semibold">{details.plan}</span>{" "}
          plan has been activated successfully.
        </p>

        <div className="text-left text-sm text-white/70 space-y-2 mb-6">
          <p>
            <span className="text-white font-semibold">Order ID:</span>{" "}
            {details.orderId}
          </p>
          <p>
            <span className="text-white font-semibold">Amount Paid:</span>{" "}
            {details.amount}
          </p>
          <p>
            <span className="text-white font-semibold">Plan Expiry:</span>{" "}
            {details.expiry}
          </p>
          <p>
            <span className="text-white font-semibold">Verification:</span>{" "}
            {details.verified ? (
              <span className="text-green-400 font-medium">Verified ✅</span>
            ) : (
              <span className="text-red-400 font-medium">Pending ⏳</span>
            )}
          </p>
        </div>

        <a
          href="/dashboard"
          className="inline-block mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold px-6 py-2.5 rounded-xl transition-all"
        >
          Go to Dashboard
        </a>
      </motion.div>

      <p className="mt-8 text-white/40 text-xs">
        © {new Date().getFullYear()} DopeGuard — Focus. Discipline. Control.
      </p>
    </main>
  );
}
