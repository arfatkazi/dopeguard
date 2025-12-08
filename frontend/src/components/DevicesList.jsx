// src/components/DevicesList.jsx
import React, { useState, useEffect } from "react";
import { Trash2, RefreshCcw } from "lucide-react";
import { removeDevice } from "../services/analyticsService";

export default function DevicesList({ devices = [], onRefresh }) {
  const [loadingId, setLoadingId] = useState(null);
  const [localDevices, setLocalDevices] = useState(devices);

  // Keep local state in sync with parent prop
  useEffect(() => {
    setLocalDevices(devices);
  }, [devices]);

  const handleRemove = async (deviceId) => {
    if (!deviceId) return;

    if (!window.confirm("Remove this device from your DopeGuard account?")) {
      return;
    }

    setLoadingId(deviceId);
    try {
      await removeDevice(deviceId); // calls DELETE /api/devices/:deviceId
      // Optimistic update
      setLocalDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to remove device:", err);
      alert(
        err?.response?.data?.message ||
          "Could not remove device. Please try again."
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  if (!localDevices || localDevices.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60 flex items-center justify-between">
        <span>No devices linked yet.</span>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/15 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Linked Devices</h4>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/15 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs text-white/70">
        {localDevices.map((d) => (
          <div
            key={d.deviceId || d._id}
            className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
          >
            <div>
              <div className="font-medium text-white text-[13px]">
                {d.browser || "Unknown browser"} · {d.os || "Unknown OS"}
              </div>
              <div className="text-[11px] text-white/45">
                ID: {d.deviceId || d._id || "—"}
              </div>
              {d.lastActive && (
                <div className="text-[11px] text-white/45">
                  Last active:{" "}
                  {new Date(d.lastActive).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              )}
            </div>

            <button
              disabled={loadingId === (d.deviceId || d._id)}
              onClick={() => handleRemove(d.deviceId || d._id)}
              className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition"
            >
              <Trash2 className="w-3 h-3" />
              {loadingId === (d.deviceId || d._id) ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
