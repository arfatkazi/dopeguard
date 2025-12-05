import React from "react";

export default function ActivityCard({ data }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-lg font-semibold mb-2">Daily Focus Summary</h3>

      <p className="text-white/70">
        Blocks Today: <span className="text-cyan-400">{data.blocksToday}</span>
      </p>

      <p className="text-white/70">
        Risky Sites Attempted:{" "}
        <span className="text-cyan-400">{data.riskyAttempts}</span>
      </p>

      <p className="text-white/70">
        Focus Score:{" "}
        <span className="text-green-400 font-semibold">{data.focusScore}</span>
      </p>
    </div>
  );
}
