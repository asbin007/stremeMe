import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
import Logo from "../components/Logo";

const Sports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Logo size="lg" />
          <a
            href="https://sportyhunter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-full transition-colors text-sm font-medium"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative flex-grow bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl min-h-[600px]"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
                <p className="text-gray-400">Loading live streams...</p>
              </div>
            </div>
          )}

          <iframe
            src="https://sportyhunter.com/"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            title="Live Sports Stream"
          />
        </motion.div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Powered by SportyHunter. We do not host any content.
        </p>
      </div>
    </div>
  );
};

export default Sports;
