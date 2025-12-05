// frontend/src/components/BlockedSitesList.jsx
import React from "react";

export default function BlockedSitesList({ sites = [] }) {
  return (
    <div className="p-4 rounded-2xl bg-white/4 border border-white/10">
      <h4 className="text-white/90 font-semibold mb-3">Top Blocked Sites</h4>
      <ul className="space-y-2">
        {sites.length === 0 && (
          <li className="text-white/60">No blocked sites yet</li>
        )}
        {sites.map((s) => (
          <li
            key={s._id}
            className="flex items-center justify-between text-white/80"
          >
            <div className="truncate">{s._id}</div>
            <div className="text-sm text-white/60">{s.count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
