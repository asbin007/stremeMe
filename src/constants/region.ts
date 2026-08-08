/**
 * Region and language used for TMDB availability lookups.
 *
 * Every watch-provider call was pinned to `watch_region=US`, which is wrong
 * for this audience: it surfaced Hulu, Max and Peacock — none of which are
 * available in India or Nepal — while hiding Disney+ Hotstar, JioCinema,
 * SonyLIV, ZEE5, MX Player, Aha and SunNXT.
 *
 * Overridable per deployment, so this does not have to be a code change if the
 * audience shifts.
 */
export const WATCH_REGION: string =
  import.meta.env.VITE_WATCH_REGION?.trim() || "IN";

/**
 * `en-IN` rather than `en-US`: TMDB returns localised titles and certification
 * data for the region, which matters for Indian releases that carry a
 * different local title.
 */
export const TMDB_LANGUAGE: string =
  import.meta.env.VITE_TMDB_LANGUAGE?.trim() || "en-IN";

/**
 * Original-language codes worth surfacing to this audience, in rough order of
 * reach. Used for language-led browsing rows.
 */
export const REGIONAL_LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "ne", label: "Nepali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "pa", label: "Punjabi" },
] as const;
