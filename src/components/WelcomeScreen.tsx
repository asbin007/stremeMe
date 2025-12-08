import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (show && !audioPlayed) {
      // Netflix intro sound
      const audio = new Audio(
        "https://www.myinstants.com/media/sounds/netflix-intro-sound.mp3"
      );
      audio.volume = 0.5;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioPlayed(true);
          })
          .catch((error) => {
            console.log("Audio autoplay blocked:", error);
          });
      }

      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 500);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, audioPlayed, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3.5,
              times: [0, 0.2, 1],
              ease: "easeIn",
            }}
            className="text-accent font-bold text-6xl md:text-9xl tracking-tighter"
          >
            STREAM ME
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
