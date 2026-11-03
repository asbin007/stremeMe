/**
 * Magnetic Hover — element subtly follows cursor when hovered.
 * Inspired by componentry.dev's Magnetic Dock.
 *
 * Imported by: Home.tsx CategoryRail buttons
 * No API or data schema — pure presentational wrapper.
 * User instruction: "use animation https://componentry.dev/"
 */
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const MagneticHover: React.FC<MagneticHoverProps> = ({
  children,
  strength = 8,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set(((e.clientX - cx) / rect.width) * strength);
    y.set(((e.clientY - cy) / rect.height) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MagneticHover;
