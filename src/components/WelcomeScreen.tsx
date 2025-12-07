import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleStart = () => {
    setHasInteracted(true);
    const audio = new Audio(
      "https://www.myinstants.com/media/sounds/netflix-intro-sound.mp3"
    );
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Audio play failed:", e));

    setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black" />
            <motion.div
              className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99c6-438e-824d-32917ce55783/IN-en-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center opacity-10"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Logo Glow Effect */}
              <div className="absolute -inset-8 bg-accent/30 blur-[60px] rounded-full animate-pulse" />

              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent blur-3xl opacity-40 rounded-full" />
                  <Logo size="2xl" animated />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 flex flex-col items-center gap-4"
            >
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
              <p className="text-gray-400 text-lg md:text-2xl font-light tracking-[0.2em] uppercase">
                Cinematic Excellence
              </p>
            </motion.div>

            {!hasInteracted ? (
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(229, 9, 20, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="mt-16 group relative px-10 py-4 bg-transparent overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 w-full h-full bg-accent/80 group-hover:bg-accent transition-colors duration-300 blur-sm" />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative text-white font-bold text-xl tracking-wider flex items-center gap-3">
                  START STREAMING
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "200px", opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="mt-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
