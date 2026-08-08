/**
 * IMPORTANT — where this can and cannot be used.
 *
 * The main streaming providers (zxcstream, cinesrc, 1embed, movish, cinemaos,
 * vidlux) detect the sandbox attribute and refuse to play, rendering "Sandbox
 * Not Supported" instead of the film. Verified against the live embeds: they
 * test for the attribute itself, so no set of tokens gets past it — adding
 * allow-popups does not help.
 *
 * StreamingPlayer therefore runs unsandboxed; blocking its ads would mean
 * blocking playback. This policy still applies to embeds that tolerate it,
 * such as the YouTube trailer player.
 *
 * Sandbox policy for third-party video embeds.
 *
 * The app itself serves no advertising. The ads users see come from inside the
 * embed providers' own documents, and the only lever this app has over them is
 * what the iframe is permitted to do. These grants are the minimum a player
 * needs to work:
 *
 * - `allow-scripts`        the player is a JS application
 * - `allow-same-origin`    it needs its own storage and same-origin XHR
 * - `allow-forms`          some providers post a form to select a source
 * - `allow-presentation`   Chromecast / Presentation API
 * - `allow-orientation-lock` landscape lock when entering fullscreen on mobile
 *
 * Deliberately withheld, because each is an ad-delivery route rather than a
 * playback requirement:
 *
 * - `allow-popups` and `allow-popups-to-escape-sandbox` — pop-unders and
 *   new-tab ads, the dominant vector on these providers
 * - `allow-top-navigation` and `allow-top-navigation-by-user-activation` —
 *   lets the embed redirect the *whole* page to an ad or scam landing page
 * - `allow-modals` — `alert`/`confirm` spam
 * - `allow-downloads` — drive-by downloads
 * - `allow-pointer-lock`
 *
 * Fullscreen is granted separately via the `allowFullScreen` attribute, which
 * is unaffected by sandboxing.
 *
 * Note: `allow-scripts` together with `allow-same-origin` normally lets a frame
 * strip its own sandbox — but only when it is same-origin with the embedder.
 * Every provider here is cross-origin, so the policy holds.
 */
export const EMBED_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock";

/**
 * Feature-policy for embeds. `autoplay` and `encrypted-media` are required for
 * playback; `clipboard-write` and `web-share` are not, and are omitted so an
 * embed cannot quietly rewrite the clipboard or trigger a share sheet.
 */
export const EMBED_ALLOW =
  "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
