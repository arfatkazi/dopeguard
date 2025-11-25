import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Enter your email");

    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Password reset link sent!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#020814] flex justify-center items-center px-4">
      <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 w-full max-w-lg shadow-2xl text-white">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/40">
            <Lock size={32} className="text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-center mb-2">
          Forgot Password?
        </h1>

        <p className="text-center text-white/70 mb-8 text-sm">
          Enter your registered email and we will send you a secure reset link.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter email"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-black shadow-xl hover:opacity-90 transition"
          >
            Send Reset Email
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
