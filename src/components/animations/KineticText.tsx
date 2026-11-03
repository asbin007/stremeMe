/**
 * Kinetic Text Reveal — words stagger in with blur + slide.
 * Inspired by componentry.dev's Kinetic Text Reveal.
 * Built with Framer Motion (already in project).
 *
 * Imported by: Home.tsx section headings, TrendingSection.tsx header
 * No API or data schema — pure presentational.
 * User instruction: "use animation https://componentry.dev/"
 */
import React from "react";
import { motion } from "framer-motion";

interface KineticTextProps {
  text: string;
  by?: "word" | "character";
  direction?: "up" | "down" | "left" | "right";
  stagger?: number;
  duration?: number;
  delay?: number;
  className?: string;
  inView?: boolean;
}

const directionMap = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

const KineticText: React.FC<KineticTextProps> = ({
  text,
  by = "word",
  direction = "up",
  stagger = 0.04,
  duration = 0.5,
  delay = 0,
  className = "",
  inView = true,
}) => {
  const units = by === "word" ? text.split(" ") : text.split("");
  const offset = directionMap[direction];

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
      ...offset,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
        : { animate: "visible" })}
    >
      {units.map((unit, i) => (
        <motion.span
          key={`${unit}-${i}`}
          variants={child}
          className="inline-block"
          style={{ whiteSpace: by === "word" ? "pre" : undefined }}
        >
          {unit}
          {by === "word" && i < units.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default KineticText;
