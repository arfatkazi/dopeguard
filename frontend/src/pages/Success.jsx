import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2, Download, KeyRound, Copy } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export default function Success() {
  const [params] = useSearchParams();

  const [details, setDetails] = useState({
    plan: "",
    orderId: "",
    amount: "",
    expiry: "",
    verified: false,
  });

  const [starterKey, setStarterKey] = useState("");
  const [starterMessage, setStarterMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState(true);
  const [downloadingStarter, setDownloadingStarter] = useState(false);
  const [downloadingPremium, setDownloadingPremium] = useState(false);
  const [error, setError] = useState("");

  const downloadFile = async (path, filename, setLoadingFn) => {
    try {
      setLoadingFn(true);

      const res = await axios.get(`${API_BASE}${path}`, {
        withCredentials: true,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert(
        err?.response?.data?.message ||
          "Download failed. Please check your plan or try again."
      );
    } finally {
      setLoadingFn(false);
    }
  };

  const fetchStarterKey = async () => {
    try {
      setLoadingKey(true);
      setStarterMessage("");

      const res = await axios.post(
        `${API_BASE}/api/extension/starter/activate`,
        {},
        { withCredentials: true }
      );

      if (res.data.success && res.data.starterKey) {
        setStarterKey(res.data.starterKey);
        setStarterMessage("Your Essential access key is ready.");
      } else {
        setStarterKey("");
        setStarterMessage(
          res.data.message || "Starter key not available for this plan."
        );
      }
    } catch (err) {
      console.error("Starter key error:", err);
      setStarterKey("");
      setStarterMessage(
        err?.response?.data?.message ||
          "Could not activate Starter key. Please try again."
      );
    } finally {
      setLoadingKey(false);
    }
  };

  useEffect(() => {
    const plan = params.get("plan") || localStorage.getItem("plan");
    const orderId = params.get("order_id") || localStorage.getItem("order_id");
    const amount = params.get("amount") || localStorage.getItem("amount");

    setDetails((prev) => ({
      ...prev,
      plan,
      orderId,
      amount: amount
        ? `₹${(Number(amount) / 100).toFixed(2)}`
        : prev.amount || "",
    }));

    axios
      .get(`${API_BASE}/api/auth/verify`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          const u = res.data.user || res.data.data?.user || res.data;

          localStorage.setItem("user", JSON.stringify(u));

          setDetails((prev) => ({
            ...prev,
            plan: prev.plan || u.plan || "",
            expiry: u.planExpiry
              ? new Date(u.planExpiry).toLocaleDateString()
              : "",
            verified: true,
          }));

          fetchStarterKey();
        } else {
          setDetails((prev) => ({ ...prev, verified: false }));
          setLoadingKey(false);
        }
      })
      .catch((err) => {
        console.error("Verify error:", err);
        setDetails((prev) => ({ ...prev, verified: false }));

        if (err?.response?.status === 401) {
          setError(
            "Your payment was processed, but your login session was not found. Please sign in again."
          );
        } else {
          setError(
            err?.response?.data?.message || "Could not verify subscription."
          );
        }

        setLoadingKey(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center bg-[#050913] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)] text-left"
      >
        <div className="flex flex-col items-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center">
            Payment Successful 🎉
          </h1>

          <p className="text-white/70 mb-2 text-center">
            Your{" "}
            <span className="text-cyan-400 font-semibold">
              {details.plan || "DopeGuard"}
            </span>{" "}
            plan has been activated successfully.
          </p>

          <p className="text-xs text-white/40 text-center">
            Next step: download your extensions and plug in your Essential key
            inside the Basic extension.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="text-sm text-white/75 space-y-2 mb-6">
          <p>
            <span className="text-white font-semibold">Order ID:</span>{" "}
            {details.orderId || "—"}
          </p>
          <p>
            <span className="text-white font-semibold">Amount Paid:</span>{" "}
            {details.amount || "—"}
          </p>
          <p>
            <span className="text-white font-semibold">Plan Expiry:</span>{" "}
            {details.expiry || "Loading..."}
          </p>
          <p>
            <span className="text-white font-semibold">Verification:</span>{" "}
            {details.verified ? (
              <span className="text-green-400 font-medium">Verified ✅</span>
            ) : (
              <span className="text-yellow-400 font-medium">Checking… ⏳</span>
            )}
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold">
              DopeGuard Essential – Access Key
            </h2>
          </div>

          <p className="text-xs text-white/60 mb-4">
            Use this key inside the{" "}
            <span className="font-semibold">Basic / Essential</span> extension.
            It lets your offline extension talk to your subscription.
          </p>

          {loadingKey ? (
            <p className="text-xs text-white/50">Generating your key… ⏳</p>
          ) : starterKey ? (
            <>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="font-mono text-xs bg-black/40 px-4 py-2 rounded-xl tracking-[0.3em]">
                  {starterKey}
                </div>

                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(starterKey)}
                  className="inline-flex items-center gap-1 text-[11px] px-3 py-2 rounded-lg border border-white/20 hover:border-cyan-400 hover:text-cyan-300 transition"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>

              <p className="text-[11px] text-white/50">{starterMessage}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-white/60 mb-3">
                {starterMessage ||
                  "Your current plan might not include Essential, or activation failed."}
              </p>

              <button
                type="button"
                onClick={fetchStarterKey}
                className="inline-flex items-center gap-1 text-[11px] px-3 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
              >
                <KeyRound className="w-3 h-3" />
                Try Generate Key Again
              </button>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <button
            type="button"
            onClick={() =>
              downloadFile(
                "/api/user/download/starter",
                "DopeGuard_Essential_Starter.zip",
                setDownloadingStarter
              )
            }
            disabled={downloadingStarter}
            className="flex flex-col items-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-cyan-400 hover:bg-white/10 transition disabled:opacity-60"
          >
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-cyan-300" />
              <span className="font-semibold text-sm">
                Download DopeGuard Essential
              </span>
            </div>

            <span className="text-[11px] text-white/55">
              Basic, no-login extension. Controlled via the key above.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadFile(
                "/api/user/download/premium",
                "DopeGuard_Premium.zip",
                setDownloadingPremium
              )
            }
            disabled={downloadingPremium}
            className="flex flex-col items-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-blue-400 hover:bg-white/10 transition disabled:opacity-60"
          >
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-blue-300" />
              <span className="font-semibold text-sm">
                Download DopeGuard Premium
              </span>
            </div>

            <span className="text-[11px] text-white/55">
              Full login + dashboard extension. Uses your account directly.
            </span>
          </button>
        </div>

        <a
          href="/dashboard"
          className="inline-block mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
        >
          Go to Dashboard
        </a>
      </motion.div>

      <p className="mt-8 text-white/40 text-xs text-center">
        © {new Date().getFullYear()} DopeGuard — Focus. Discipline. Control.
      </p>
    </main>
  );
}