import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) toast.error("Invalid reset link");
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      return toast.error("Enter new password");
    }

    // 🔥 FRONTEND PASSWORD RULES (same as backend)
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (!/[A-Z]/.test(newPassword))
      return toast.error("Password must contain an uppercase letter");
    if (!/[a-z]/.test(newPassword))
      return toast.error("Password must contain a lowercase letter");
    if (!/[0-9]/.test(newPassword))
      return toast.error("Password must contain a number");
    if (!/[\W_]/.test(newPassword))
      return toast.error("Password must contain a special character");

    try {
      await axios.post(
        `/api/auth/reset-password/${token}`,
        { password: newPassword },
        { withCredentials: true }
      );

      toast.success("Password reset successful!");

      // 🔥 Tell Navbar to update user instantly
      window.dispatchEvent(new Event("userUpdated"));

      // Backend already logged in → go home
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-[#020814] flex justify-center items-center px-4">
      <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-10 w-full max-w-lg shadow-2xl text-white">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/40">
            <Lock size={32} className="text-blue-400" />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-center mb-3">
          Create New Password
        </h1>

        <p className="text-center text-white/60 mb-8 text-sm">
          Enter your new password below
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPass((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer"
            >
              {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-black shadow-xl hover:opacity-90 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
