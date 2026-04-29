import React, { useEffect } from "react"; // Removed useState
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"; // Unused icons
import { motion } from "framer-motion";
import { /*register,*/ clearError } from "../store/authSlice";
import type { AppDispatch, RootState } from "../store/store";

const Register: React.FC = () => {
  /* Unused state variables - commented out due to disabled email registration
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  */
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // const { isLoading, error, requiresOtp } = useSelector(
  const { error, requiresOtp } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (requiresOtp) {
      navigate("/verify-otp");
    }
    return () => {
      dispatch(clearError());
    };
  }, [requiresOtp, navigate, dispatch]);

  /*
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ username, email, password }));
  };
  */

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-secondary/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-text-muted">Join Aura Screen today</p>
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

        <div className="text-center bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-xl mb-6">
          <p className="text-yellow-500 mb-4">
            Registration via email is currently disabled.
          </p>
          <p className="text-text-muted">
            Please use Google Login on the{" "}
            <Link to="/login" className="text-accent hover:underline">
              Sign In
            </Link>{" "}
            page.
          </p>
        </div>

        {/* Email Registration Form - Disabled
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted ml-1">
              Username
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                placeholder="johndoe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                placeholder="••••••••"
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
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        */}

        <p className="mt-8 text-center text-text-muted text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent hover:text-accent-hover font-medium hover:underline transition-all"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
