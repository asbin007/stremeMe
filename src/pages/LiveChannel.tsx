import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Globe, Tv, ShieldAlert, Loader2 } from "lucide-react";
import Button from "../components/Button";
import HlsPlayer from "../components/HlsPlayer";
import ShareButton from "../components/ShareButton";
import { iptvService, type Channel } from "../services/iptv";
import { SITE_URL } from "../const";

/**
 * A single live channel, addressable at /live/:slug.
 *
 * This page previously rendered five hardcoded channels with no streams
 * attached, and its "Watch Live" button opened an advertising smartlink
 * (onionclose.com) in a new tab rather than playing anything. It now resolves
 * the slug against the real IPTV playlists and plays the channel inline.
 */
const LiveChannel: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const found = await iptvService.resolveSlug(slug, controller.signal);
        if (!controller.signal.aborted) setChannel(found);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-text-muted">Finding channel…</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Tv className="h-14 w-14 text-text-muted opacity-40" />
        <h1 className="text-2xl font-bold text-white">Channel not found</h1>
        <p className="max-w-md text-text-muted">
          This channel may have been removed from the public playlists, which change often.
        </p>
        <Button onClick={() => navigate("/live-tv")}>Browse Live TV</Button>
      </div>
    );
  }

  const canonical = `${SITE_URL}/live/${channel.slug}`;
  const description = `Watch ${channel.name} live online free in HD. ${channel.group} channel streaming on AuraScreen.`;

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BroadcastService",
    name: channel.name,
    description,
    genre: channel.group,
    url: canonical,
    provider: { "@type": "Organization", name: "AuraScreen" },
  };

  return (
    <>
      <Helmet>
        <title>{`Watch ${channel.name} Live | Live TV — AuraScreen`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={`${channel.name} | Live TV — AuraScreen`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="AuraScreen" />
        {channel.logo && <meta property="og:image" content={channel.logo} />}

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${channel.name} | Live TV — AuraScreen`} />
        <meta name="twitter:description" content={description} />

        {/* Structured data must live inside Helmet to reach <head>; as a bare
            <script> in the body React renders it as inert text. */}
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 pt-20 md:pt-8">
        <Link
          to="/live-tv"
          className="mb-6 inline-flex items-center gap-2 text-text-muted transition-colors hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Live TV</span>
        </Link>

        {/* Player */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black pt-[56.25%] shadow-2xl md:rounded-3xl">
          <div className="absolute inset-0">
            <HlsPlayer
              key={channel.url}
              src={channel.url}
              poster={channel.logo}
              label={channel.name}
              autoPlay
            />
          </div>
        </div>

        {/* Channel header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-secondary/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  onError={e => (e.currentTarget.style.visibility = "hidden")}
                />
              ) : (
                <Tv className="h-10 w-10 text-accent/50" />
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                  Live
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {channel.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {channel.country ?? "International"}
                </span>
                <span aria-hidden="true">•</span>
                <span>{channel.group}</span>
                {channel.insecure && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                    <ShieldAlert className="h-3 w-3" />
                    Insecure source
                  </span>
                )}
              </div>
            </div>
          </div>

          <ShareButton title={`${channel.name} live`} url={canonical} />
        </div>
      </div>
    </>
  );
};

export default LiveChannel;
