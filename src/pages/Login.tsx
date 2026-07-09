import React from "react";
import { SignIn } from "@clerk/react";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "bg-secondary/30 backdrop-blur-xl border border-white/10 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              formFieldLabel: "text-gray-400",
              formFieldInput: "bg-black/20 border-white/10 text-white",
              footerActionLink: "text-accent hover:text-accent",
              formButtonPrimary: "bg-accent hover:bg-red-700",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;
