import React, { useEffect, useState, useRef } from "react";
import { tmdbService } from "../services/tmdb";
import YouTube, { type YouTubeProps } from "react-youtube";
import useSaveData from "../hooks/useSaveData";

interface VideoPreviewProps {
  id: number;
  type: "movie" | "tv";
  isActive: boolean;
  onVideoPlay?: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  id,
  type,
  isActive,
  onVideoPlay,
}) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const saveData = useSaveData();
  /** react-youtube's onReady event target; only the player controls are used. */
  const playerRef = useRef<{
    internalPlayer: {
      playVideo: () => void;
      pauseVideo: () => void;
      seekTo: (seconds: number) => void;
    };
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchVideo = async () => {
      try {
        const data = await tmdbService.getVideos(type, id);
        // Find the first trailer or teaser
        const trailer = data.results.find(
          (vid) =>
            vid.site === "YouTube" &&
            (vid.type === "Trailer" || vid.type === "Teaser")
        );
        if (isMounted && trailer) {
          setVideoKey(trailer.key);
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    };

    // Skip the lookup entirely on Data Saver — no request, no player, no
    // stream. A hover preview is not worth the viewer's mobile data.
    if (isActive && !videoKey && !saveData) {
      fetchVideo();
    }

    return () => {
      isMounted = false;
    };
  }, [isActive, id, type, videoKey, saveData]);

  // Reset player when inactive
  useEffect(() => {
    if (!isActive && playerRef.current) {
      playerRef.current.internalPlayer.pauseVideo();
      playerRef.current.internalPlayer.seekTo(0);
    } else if (isActive && playerRef.current) {
      playerRef.current.internalPlayer.playVideo();
    }
  }, [isActive]);

  if (!videoKey) return null;

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      modestbranding: 1,
      loop: 1,
      playlist: videoKey, // Required for loop to work
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      fs: 0,
    },
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    if (isActive) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    // State 1 is playing
    if (event.data === 1 && onVideoPlay) {
      onVideoPlay();
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-black overflow-hidden rounded-lg pointer-events-none">
      <div className="w-[150%] h-[150%] -ml-[25%] -mt-[25%]">
        <YouTube
          videoId={videoKey}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="w-full h-full object-cover"
          iframeClassName="w-full h-full object-cover"
        />
      </div>
      {/* Overlay to prevent interaction with iframe */}
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
};

export default VideoPreview;
