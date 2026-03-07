// PricingCard.jsx
import React from "react";

export default function PricingCard({
  title,
  price,
  desc,
  features,
  highlight,
}) {
  return (
    <div
      className={`card p-8 text-left transition-all ${
        highlight ? "border-primary/50 bg-white/10" : "bg-white/5"
      }`}
    >
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-4xl font-bold text-primary mb-2">{price}</p>
      <p className="text-white/70 mb-6">{desc}</p>
      <ul className="space-y-2 mb-6 text-white/80">
        {features.map((f, i) => (
          <li key={i}>✅ {f}</li>
        ))}
      </ul>
      <button
        className={`w-full py-2 rounded-lg font-semibold ${
          highlight
            ? "bg-primary text-white hover:opacity-90"
            : "bg-white/10 hover:bg-white/20"
        }`}
      >
        {highlight ? "Get Pro" : "Start Free"}
      </button>
    </div>
  );
}
