import React from "react";
import { X } from "lucide-react";
import { EMBED_ALLOW, EMBED_SANDBOX } from "../constants/embed";

interface VideoPlayerProps {
  videoUrl: string | null;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

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
          sandbox={EMBED_SANDBOX}
          allow={EMBED_ALLOW}
          referrerPolicy="origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
