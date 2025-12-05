// frontend/src/components/WeeklyFocusChart.jsx
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function WeeklyFocusChart({ data = [] }) {
  const hasData = Array.isArray(data) && data.length > 0;
  // data: [{ date: '2025-12-01', focusTime: 120, blockedCount: 3 }, ...]
  return (
    <div className="p-4 rounded-2xl bg-white/4 border border-white/10">
      <h4 className="text-white/90 font-semibold mb-2">Weekly Focus</h4>
      <div style={{ height: 200 }}>
        {hasData ? (
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="focusGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: "#cbd5e1" }} />
              <YAxis tick={{ fill: "#cbd5e1" }} />
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="focusTime"
                stroke="#06b6d4"
                fill="url(#focusGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            No focus data yet. We'll show your next session here.
          </div>
        )}
      </div>
    </div>
  );
}
