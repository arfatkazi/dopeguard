// frontend/src/components/BlockedSitesList.jsx
import React from "react";

export default function BlockedSitesList({ sites = [] }) {
  return (
    <div className="p-4 rounded-2xl bg-white/4 border border-white/10">
      <h4 className="text-white/90 font-semibold mb-3">
        Top Blocked Sites Images
      </h4>
      <div className="flex items-center justify-between mb-3 text-white/90 text-sm">
        <div>Site</div>
        <div>Count</div>
      </div>

      <div className="h-[1px] bg-white/10 mb-3 bg-gradient-to-r from-cyan-400 to-blue-400" />

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

        <div className="h-[1px] bg-white/10 mb-3 bg-gradient-to-r from-cyan-400 to-blue-400" />

        <div className="flex items-center justify-between mb-3 text-white/95 text-sm ">
          <div>Total</div>
          <div>{sites.reduce((acc, s) => acc + s.count, 0)}</div>
        </div>
        <div className="h-[1px] bg-white/10 mb-3 bg-gradient-to-r from-cyan-400 to-blue-400" />
      </ul>
    </div>
  );
}
