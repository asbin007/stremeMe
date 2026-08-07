import React from "react";
import { motion } from "framer-motion";
import { EMBED_ALLOW, EMBED_SANDBOX } from "../constants/embed";

const Sports: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col pt-16 md:pt-0">
      <div className="container mx-auto px-4 py-4 md:py-6 flex-grow flex flex-col max-w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* YoSinTV Embedded Player */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex-1 bg-surface rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          <iframe
            src="https://www.yosin-tv.net/"
            className="w-full h-full border-0 bg-black"
            allowFullScreen
            // `allow-popups` used to be granted here, which is exactly the
            // permission this provider uses to open pop-under ads.
            sandbox={EMBED_SANDBOX}
            allow={EMBED_ALLOW}
            referrerPolicy="origin"
            title="YoSinTV - Live Sports Streaming"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Sports;
