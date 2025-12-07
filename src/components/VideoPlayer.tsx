import React from "react";
import { X } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  React.useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://pl28209844.effectivegatecpm.com/b9/71/73/b9717300297046b402f79fb665d71da6.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <iframe
          src={videoUrl}
          title="Video Player"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
