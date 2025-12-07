import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { verifyOtp, resendOtp } from "../store/authSlice";
import type { AppDispatch, RootState } from "../store/store";

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { emailForOtp, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailForOtp) {
      const resultAction = await dispatch(
        verifyOtp({ email: emailForOtp, otp })
      );
      if (verifyOtp.fulfilled.match(resultAction)) {
        navigate("/");
      }
    }
  };

  const handleResend = () => {
    if (emailForOtp) {
      dispatch(resendOtp(emailForOtp));
    }
  };

  if (!emailForOtp) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-green-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-secondary/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
          <p className="text-text-muted">
            Enter the code sent to{" "}
            <span className="text-white font-medium">{emailForOtp}</span>
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all tracking-[1em] text-center text-2xl font-mono"
                placeholder="......"
                maxLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Verify Code
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={handleResend}
            className="text-text-muted hover:text-white transition-colors text-sm flex items-center justify-center mx-auto gap-2 group"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Resend Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
