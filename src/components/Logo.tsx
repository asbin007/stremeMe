import React from "react";
import { Play } from "lucide-react";
import clsx from "clsx";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className,
  size = "md",
  showText = true,
  animated = false,
}) => {
  const sizeClasses = {
    sm: {
      container: "p-1.5 rounded-lg",
      icon: "w-4 h-4",
      text: "text-lg",
    },
    md: {
      container: "p-2 rounded-lg",
      icon: "w-6 h-6",
      text: "text-2xl",
    },
    lg: {
      container: "p-2.5 rounded-xl",
      icon: "w-8 h-8",
      text: "text-3xl",
    },
    xl: {
      container: "p-4 rounded-2xl",
      icon: "w-12 h-12",
      text: "text-5xl",
    },
    "2xl": {
      container: "p-6 md:p-8 rounded-3xl",
      icon: "w-16 h-16 md:w-24 md:h-24",
      text: "text-6xl md:text-9xl",
    },
  };

  const { container, icon, text } = sizeClasses[size];

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div
        className={clsx(
          "bg-gradient-to-br from-accent to-blue-600 transform rotate-12 shadow-lg flex items-center justify-center",
          container,
          animated && "animate-pulse"
        )}
      >
        <Play className={clsx("text-white fill-white", icon)} />
      </div>
      {showText && (
        <span
          className={clsx(
            "font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500",
            text
          )}
        >
          Aura <span className="text-accent">Screen</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
