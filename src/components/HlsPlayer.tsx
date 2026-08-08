import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertTriangle, Loader2, RotateCw, ShieldAlert } from "lucide-react";

interface HlsPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  /** Shown in error copy so the user knows which channel failed. */
  label?: string;
}

type Status = "loading" | "playing" | "error";

/** Fatal network errors are retried this many times before giving up. */
const MAX_RECOVERIES = 3;

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, poster, autoPlay = true, label }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");
  /** Bumping this re-runs the effect, which is how retry restarts playback. */
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus("loading");
    setMessage("");
    setAttempt(a => a + 1);
  }, []);

  // An http:// stream on an https:// page is blocked by the browser before any
  // request goes out. This follows from the src alone, so it is derived during
  // render rather than pushed into state from an effect.
  const isBlocked = useMemo(
    () => window.location.protocol === "https:" && src.startsWith("http://"),
    [src]
  );

  /**
   * Whether this browser can play HLS at all — via hls.js (MSE) or natively
   * (Safari). Both are capability checks that do not depend on the stream, so
   * they are computed once during render.
   */
  const canPlayHls = useMemo(() => {
    if (Hls.isSupported()) return true;
    return (
      document.createElement("video").canPlayType("application/vnd.apple.mpegurl") !== ""
    );
  }, []);

  // Reset during render when the stream changes, rather than from inside the
  // effect. React's documented pattern for deriving state from props, and it
  // avoids the extra render pass a setState-in-effect would cost.
  const streamKey = `${src}:${attempt}`;
  const [renderedKey, setRenderedKey] = useState(streamKey);
  if (streamKey !== renderedKey) {
    setRenderedKey(streamKey);
    setStatus("loading");
    setMessage("");
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || isBlocked || !canPlayHls) return;

    let hls: Hls | null = null;
    let recoveries = 0;
    let cancelled = false;

    const markPlaying = () => {
      if (!cancelled) setStatus("playing");
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        manifestLoadingTimeOut: 15_000,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        markPlaying();
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay policy, not a stream failure — controls are visible.
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (cancelled || !data.fatal) return;

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // The old code called startLoad() unconditionally, so a dead
            // channel — of which these public playlists have many — retried
            // forever, hammering the host and never telling the user.
            if (recoveries < MAX_RECOVERIES) {
              recoveries += 1;
              hls?.startLoad();
            } else {
              setStatus("error");
              setMessage("This channel is offline or unreachable.");
              hls?.destroy();
            }
            break;

          case Hls.ErrorTypes.MEDIA_ERROR:
            if (recoveries < MAX_RECOVERIES) {
              recoveries += 1;
              hls?.recoverMediaError();
            } else {
              setStatus("error");
              setMessage("This channel's video stream could not be decoded.");
              hls?.destroy();
            }
            break;

          default:
            setStatus("error");
            setMessage("This channel could not be played.");
            hls?.destroy();
            break;
        }
      });
    } else {
      // Native HLS (Safari, iOS). The unsupported case is handled by
      // `canPlayHls` during render, so there is no third branch here.
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        if (cancelled) return;
        markPlaying();
        if (autoPlay) video.play().catch(() => {});
      });
      video.addEventListener("error", () => {
        if (cancelled) return;
        setStatus("error");
        setMessage("This channel is offline or unreachable.");
      });
    }

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src, autoPlay, attempt, isBlocked, canPlayHls]);

  const failed = isBlocked || !canPlayHls || status === "error";
  const errorText = isBlocked
    ? "This channel is only available over an insecure connection, which browsers block on HTTPS sites."
    : !canPlayHls
      ? "Your browser cannot play this stream format."
      : message;

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        controls
        poster={poster}
        playsInline
        aria-label={label ? `${label} live stream` : "Live stream"}
        className="h-full w-full bg-black object-contain"
      />

      {status === "loading" && !failed && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-text-muted">Connecting to stream…</p>
        </div>
      )}

      {failed && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center"
        >
          {isBlocked ? (
            <ShieldAlert className="h-10 w-10 text-warning" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-warning" />
          )}

          <p className="max-w-md text-sm text-text">{errorText}</p>
          <p className="text-xs text-text-muted">
            Free IPTV channels go offline often. Try another channel from the list.
          </p>

          {!isBlocked && canPlayHls && status === "error" && (
            <button
              type="button"
              onClick={retry}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              <RotateCw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HlsPlayer;
