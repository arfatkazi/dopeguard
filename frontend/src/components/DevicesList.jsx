import React, { useState } from "react";
import { toast } from "react-toastify";
import { request } from "../utils/api";

export default function DevicesList({ devices = [], onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this device?")) return;

    setLoading(true);

    const res = await request(`/api/extension/remove-device/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Device removed");
      onRefresh();
    } else {
      toast.error(res.data?.message || "Failed to remove device");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold mb-3">Your Devices</h3>

      {devices.length === 0 && (
        <p className="text-white/60 text-sm">No devices registered.</p>
      )}

      <ul className="space-y-3">
        {devices.map((d) => (
          <li
            key={d._id}
            className="flex justify-between items-center py-2 px-3 rounded bg-white/5"
          >
            <div>
              <p className="font-medium text-cyan-400">{d.browser}</p>
              <p className="text-xs text-white/60">{d.os}</p>
            </div>

            <button
              className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/40 rounded-lg"
              onClick={() => handleRemove(d._id)}
              disabled={loading}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
