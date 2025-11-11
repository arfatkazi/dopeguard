import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#050913] text-white text-center px-4">
      {/* 🌌 Animated Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* ❌ Failure Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.2)] relative z-10"
      >
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />

        <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
          Payment Failed ❌
        </h1>

        <p className="text-white/70 mb-6 max-w-md mx-auto">
          Something went wrong while processing your payment. Don’t worry — no
          money was deducted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/pricing"
            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-black transition-all"
          >
            Try Again
          </a>

          <a
            href="/contact"
            className="px-6 py-2.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white/80 backdrop-blur-sm transition-all"
          >
            Contact Support
          </a>
        </div>
      </motion.div>

      <p className="mt-8 text-white/40 text-xs">
        © {new Date().getFullYear()} DopeGuard — Focus. Discipline. Control.
      </p>
    </main>
  );
}
