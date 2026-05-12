import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, poster, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (!video || !src) return;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch((err) => console.log("Autoplay blocked:", err));
        }
      });

      // Error handling and auto-recovery
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("Fatal network error encountered, trying to recover...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Fatal media error encountered, trying to recover...");
              hls?.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error:", data.type);
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native support (Safari)
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        if (autoPlay) {
          video.play().catch((err) => console.log("Autoplay blocked:", err));
        }
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      poster={poster}
      className="w-full h-full object-contain bg-black rounded-xl shadow-2xl"
    />
  );
};

export default HlsPlayer;
