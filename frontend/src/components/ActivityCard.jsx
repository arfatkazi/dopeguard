import React from "react";

export default function ActivityCard({ item, data }) {
  // Support both prop names while avoiding undefined errors
  const activity = item || data || {};

  // If the activity represents an aggregated daily snapshot (old API), render
  // the summary metrics instead of the per-site view to stay backward
  // compatible with existing responses.
  const isSummaryCard =
    activity.blocksToday !== undefined ||
    activity.riskyAttempts !== undefined ||
    activity.focusScore !== undefined;

  if (isSummaryCard) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h3 className="text-lg font-semibold mb-2">Daily Focus Summary</h3>

        <p className="text-white/70">
          Blocks Today:{" "}
          <span className="text-cyan-400">{activity.blocksToday ?? 0}</span>
        </p>

        <p className="text-white/70">
          Risky Sites Attempted:{" "}
          <span className="text-cyan-400">{activity.riskyAttempts ?? 0}</span>
        </p>

        <p className="text-white/70">
          Focus Score:{" "}
          <span className="text-green-400 font-semibold">
            {activity.focusScore ?? 0}
          </span>
        </p>
      </div>
    );
  }

  const site =
    activity.site || activity.url || activity.domain || "Unknown site";
  const blocked = Boolean(activity.blocked);
  const duration = activity.duration ?? 0;
  const timestamp = activity.timestamp
    ? new Date(activity.timestamp).toLocaleString()
    : activity.date
    ? new Date(activity.date).toLocaleString()
    : "Unknown time";

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{site}</h3>
        <span
          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            blocked
              ? "bg-red-500/20 text-red-300 border border-red-500/30"
              : "bg-green-500/20 text-green-300 border border-green-500/30"
          }`}
        >
          {blocked ? "Blocked" : "Allowed"}
        </span>
      </div>

      <p className="text-white/70 mb-1">{timestamp}</p>

      <p className="text-white/70 text-sm">
        Duration: <span className="text-cyan-400">{Math.round(duration)}s</span>
      </p>
    </div>
  );
}
