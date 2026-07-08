import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setCredentials } from "../store/authSlice";
import { Loader2 } from "lucide-react";

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // Construct user object from token
        const user = {
          id: decoded.id,
          username: decoded.username || "User",
          email: decoded.email || "",
          role: decoded.role || "user",
          avatarUrl: decoded.avatarUrl || "",
          isVerified: true,
        };

        dispatch(setCredentials({ user, token }));
        
        // Use replace to prevent back-button returning to callback
        setTimeout(() => navigate("/", { replace: true }), 100);
      } catch (error) {
        console.error("Token decode failed:", error);
        navigate("/login?error=auth_failed", { replace: true });
      }
    } else {
      navigate("/login?error=no_token", { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10 bg-secondary/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-white font-medium">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
