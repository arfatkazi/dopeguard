import React from "react";
import { useSearchParams } from "react-router-dom";

export default function Upgrade() {
  const [params] = useSearchParams();
  const expired = params.get("expired") === "true";

  return (
    <main className="min-h-screen bg-[#050913] text-white pt-28 pb-20">
      <div className="container mx-auto text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">
          {expired ? "Your Subscription Has Expired" : "Upgrade Your Plan"}
        </h1>

        <p className="text-white/60 text-lg mb-10">
          {expired
            ? "Your AI Shield is currently turned OFF. Renew your plan to reactivate DopeGuard protection."
            : "Choose a subscription plan that fits your focus journey."}
        </p>

        {/* Button */}
        <a
          href="/pricing"
          className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl shadow-lg transition-all"
        >
          View Plans & Renew
        </a>
      </div>
    </main>
  );
}
