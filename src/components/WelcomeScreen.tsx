import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

// Generate particles outside render to avoid purity violations
const generateParticles = () =>
  Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

const ParticleEffect: React.FC = () => {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const GlowRing: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border border-accent/20 rounded-full"
          style={{
            width: 200 + i * 150,
            height: 200 + i * 150,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />  
      ))}
    </div>
  );
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
      <motion.div
        className="h-full bg-gradient-to-r from-accent via-purple-500 to-accent"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        style={{
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
        }}
      />
    </div>
  );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(
      "https://www.myinstants.com/media/sounds/netflix-intro-sound.mp3"
    );
    audio.volume = 0.3;
    audioRef.current = audio;

    if (!audioPlayed) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioPlayed(true);
          })
          .catch(() => {
            // Audio blocked, continue without sound
          });
      }
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    // Timer for complete
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioPlayed, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-gradient-to-br from-black via-purple-950/50 to-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
        >
          {/* Particle Effect */}
          <ParticleEffect />

          {/* Glow Rings */}
          <GlowRing />

          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-[100px] -top-48 -left-48"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[100px] -bottom-32 -right-32"
            animate={{
              x: [0, -80, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Logo Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8 inline-flex"
            >
              <div className="relative">
                {/* Outer glow */}
                <motion.div
                  className="absolute inset-0 bg-accent/50 rounded-2xl blur-xl"
                  animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {/* Icon container */}
                <div className="relative bg-gradient-to-br from-accent to-purple-600 p-6 rounded-2xl">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Text glow effect */}
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-accent via-purple-400 to-pink-500 opacity-50" />
              <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-black tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
                  AURA
                </span>
              </h1>
              <h2 className="relative text-3xl md:text-5xl lg:text-6xl font-bold tracking-wide mt-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">
                  SCREEN
                </span>
              </h2>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 1], y: [20, 0, 0] }}
              transition={{ duration: 0.7, delay: 0.6, times: [0, 0.5, 1] }}
              className="mt-8"
            >
              <p className="text-lg md:text-xl text-white/60 tracking-[0.3em] uppercase font-light">
                Watch Without Limits
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="mt-12 flex flex-col items-center gap-3"
            >
              <ProgressBar progress={progress} />
              <span className="text-white/40 text-sm tracking-wider">
                {Math.round(progress)}%
              </span>
            </motion.div>

            {/* Skip hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, delay: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-sm tracking-wider"
            >
              Press any key to skip
            </motion.p>
          </div>

          {/* Film grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;