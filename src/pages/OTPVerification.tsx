import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock } from "lucide-react";
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-secondary/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Verify OTP
        </h2>
        <p className="text-text-muted text-center mb-6">
          Enter the code sent to {emailForOtp}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-primary/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all tracking-widest text-center text-xl"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            className="text-accent hover:text-accent-hover font-medium text-sm"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
