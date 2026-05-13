import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-95";

  const variants = {
    primary: "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]",
    secondary: "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/10",
    outline:
      "border-2 border-white/20 bg-transparent text-white hover:bg-white hover:text-black hover:border-white",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 py-2 text-sm",
    lg: "h-14 px-10 text-base md:text-lg",
    icon: "h-10 w-10 rounded-full",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
