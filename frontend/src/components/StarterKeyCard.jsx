// src/components/dashboard/StarterKeyCard.jsx
import { useEffect, useState } from "react";
import {
  activateStarterKey,
  deactivateStarterKey,
} from "../services/starterService";

const STORAGE_KEY = "dg.starterKeyState";

function StarterKeyCard() {
  const [loading, setLoading] = useState(false);
  const [starterKey, setStarterKey] = useState("");
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");

  // Load persisted state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setStarterKey(parsed.starterKey || "");
        setActive(Boolean(parsed.active));
      }
    } catch (err) {
      console.warn("Failed to restore Starter key state", err);
    }
  }, []);

  // Persist whenever key / active changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ starterKey, active }));
    } catch (err) {
      console.warn("Failed to save Starter key state", err);
    }
  }, [starterKey, active]);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await activateStarterKey();
      if (res.success && res.starterKey) {
        setStarterKey(res.starterKey);
        setActive(true);
        setMessage("Starter key activated.");
      } else {
        setMessage(res.message || "Starter key not available for this plan.");
      }
    } catch (err) {
      setMessage(err.message || "Could not activate Starter key.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await deactivateStarterKey();
      if (res.success) {
        setActive(false);
        setMessage("Starter key deactivated.");
      } else {
        setMessage(res.message || "Could not deactivate Starter key.");
      }
    } catch (err) {
      setMessage(err.message || "Could not deactivate Starter key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Essential Extension Key</h3>
        <span
          className={`text-[10px] px-2 py-1 rounded-full ${
            active
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-slate-700/40 text-slate-300 border border-slate-600"
          }`}
        >
          {active ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Use this key inside the{" "}
        <span className="font-semibold">Basic / Essential</span> extension. You
        can regenerate or deactivate it anytime.
      </p>

      {starterKey && (
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-xs bg-slate-800 px-3 py-2 rounded-xl tracking-[0.3em]">
            {starterKey}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(starterKey)}
            className="text-[11px] px-2 py-1 rounded-lg border border-slate-600 hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Copy
          </button>
        </div>
      )}

      {message && <p className="text-[11px] text-slate-400">{message}</p>}

      <div className="flex items-center gap-2 mt-1">
        <button
          disabled={loading}
          onClick={handleGenerate}
          className="text-xs px-3 py-2 rounded-xl bg-emerald-500/80 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-60"
        >
          {starterKey ? "Refresh Key" : "Generate Key"}
        </button>
        <button
          disabled={loading || !starterKey}
          onClick={handleDeactivate}
          className="text-xs px-3 py-2 rounded-xl border border-slate-600 text-slate-300 hover:border-red-400 hover:text-red-300 disabled:opacity-40"
        >
          Deactivate
        </button>
      </div>
    </div>
  );
}

export default StarterKeyCard;
