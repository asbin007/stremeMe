import type { FAQ } from "../components/CategoryFAQ";

// Per-category SEO copy. Keep each page's intro + FAQs genuinely different
// from the others — Google deduplicates near-identical blocks and treats
// the second one as noise. Rewrite freely without touching the components
// that render them.

export interface CategoryCopy {
  title: string;
  intro: string;
  faqs: FAQ[];
}

export const CATEGORY_COPY: Record<string, CategoryCopy> = {
  movies: {
    title: "About free movies on AuraScreen",
    intro:
      "AuraScreen catalogs thousands of movies you can stream in HD without signing up — from Hollywood blockbusters and indie dramas to Bollywood, Korean, and anime features. Filter by streaming service (Netflix, Prime Video, Disney+, Max, Hulu, Apple TV+), by genre, or by release year, then play directly in your browser. New releases are refreshed daily.",
    faqs: [
      { q: "Is AuraScreen free to use?", a: "Yes. Every movie on AuraScreen can be streamed free in HD. You don't need to create an account to watch, and there is no premium tier." },
      { q: "Do I need to sign up or install anything?", a: "No signup, no download. The player runs in your browser on desktop and mobile. You can optionally install AuraScreen as a Progressive Web App for a full-screen experience." },
      { q: "How do I filter movies by streaming platform?", a: "Use the platform chips above the grid to narrow results to titles streamable on Netflix, Prime Video, Disney+, Hulu, Max, Apple TV+, Crunchyroll, Paramount+, or Peacock. The data comes from TMDB and reflects the US region." },
      { q: "What video quality is available?", a: "Where the source supports it, movies play in Full HD (1080p). The player auto-adjusts to your connection and defaults to the highest stable quality." },
      { q: "Can I save movies to watch later?", a: "Yes. The bookmark icon on each movie card adds it to your watchlist. Signed-in users have their watchlist synced across devices; signed-out users keep it in local storage." },
    ],
  },

  "tv-shows": {
    title: "About free TV shows on AuraScreen",
    intro:
      "Stream thousands of TV series, dramas, documentaries, and reality shows for free in HD. AuraScreen tracks every season and episode so you can pick up where you left off — no sign-up required. Browse by platform (Netflix, Prime, Disney+, Max, Hulu, Apple TV+), by genre, or by popularity.",
    faqs: [
      { q: "Does AuraScreen have full seasons?", a: "Yes. Where the source supports it, every available season and episode is listed on the show's page. Latest aired episodes are added as they become available upstream." },
      { q: "Can I continue watching from where I stopped?", a: "Yes. Playback position is remembered per episode. Open the show again and the next episode resumes at the right spot." },
      { q: "How current are the episodes?", a: "New episodes typically appear within a few hours of their original airdate. Weekly releases are tracked automatically." },
      { q: "Can I watch shows on mobile?", a: "Yes. The site is fully responsive and installable as a PWA on iOS and Android. The video player supports fullscreen, picture-in-picture, and background audio where the OS allows." },
      { q: "Are subtitles available?", a: "Subtitles are available on most titles where the source provides them. English is included by default and additional languages are selectable from the player menu when available." },
    ],
  },

  anime: {
    title: "About free anime on AuraScreen",
    intro:
      "Watch anime series and movies free in HD on AuraScreen — from current simulcasts to classic Shonen, Seinen, and Studio Ghibli catalogues. Browse by genre, filter by Crunchyroll availability, and track your watchlist. English dubs and original Japanese audio are available where the source supports it.",
    faqs: [
      { q: "Does AuraScreen offer sub and dub?", a: "Both are available on most titles. Switch between Japanese (subtitled) and English dub from the player menu when the source provides both tracks." },
      { q: "Are new episodes added weekly?", a: "Yes. Seasonal anime episodes are typically available within hours of the original Japanese broadcast. Older catalogue titles are added continuously." },
      { q: "Can I filter to Crunchyroll-only anime?", a: "Yes. Use the Crunchyroll chip in the platform tabs to narrow the list to titles officially streamable on Crunchyroll." },
      { q: "Is there a mobile anime experience?", a: "The anime pages are fully responsive. Installing AuraScreen as a PWA gives you a full-screen app feel on iOS and Android." },
    ],
  },

  "hindi-movies": {
    title: "About free Hindi movies on AuraScreen",
    intro:
      "AuraScreen's Hindi movies catalogue covers Bollywood classics, recent box-office releases, regional cinema, and web films — all streamable free in HD. Filter by release year or genre, discover trending titles, and continue watching across devices.",
    faqs: [
      { q: "Does AuraScreen include new Bollywood releases?", a: "Yes. New Hindi theatrical releases are added as soon as the source becomes available. The Movies page's Newest sort surfaces them first." },
      { q: "Are regional Indian films available?", a: "The core catalogue is Hindi; Tamil, Telugu, and other regional titles appear when they have official Hindi dubs or are listed under the Hindi catalogue in TMDB." },
      { q: "Can I watch Hindi movies with subtitles?", a: "Where the source provides English subtitles, they can be toggled from the player menu." },
      { q: "Is there a Hindi TV shows section?", a: "The TV Shows page lists Indian web series and shows. Combine the Hindi language filter with the TV page to narrow results." },
    ],
  },

  "live-tv": {
    title: "About free live TV on AuraScreen",
    intro:
      "Watch live TV channels free on AuraScreen — news, sports, music, kids, entertainment, and international feeds. No cable subscription, no account. Channels are grouped by category so you can jump straight to BBC News, ESPN, MTV, or any of hundreds of streams in a click.",
    faqs: [
      { q: "How many live channels are available?", a: "Several hundred, spanning English-language news, sports, entertainment, kids, music, and international channels. The list refreshes daily." },
      { q: "Do the live streams have ads?", a: "AuraScreen does not insert ads. If an upstream broadcaster includes commercials in the live feed, those pass through unchanged." },
      { q: "Can I watch live sports?", a: "Yes — the Sports page curates live sports channels and events. Availability varies by region and by what the source provides at the time." },
      { q: "Does live TV work on mobile?", a: "Yes. The HLS player works on iOS Safari, Android Chrome, and desktop browsers. Install as a PWA for a native-feel full-screen experience." },
    ],
  },

  sports: {
    title: "About free live sports on AuraScreen",
    intro:
      "Follow live football, cricket, basketball, F1, UFC, and more on AuraScreen. The Sports page groups upcoming fixtures and live streams by league so you can jump to Premier League, La Liga, NBA, IPL, or any ongoing event quickly.",
    faqs: [
      { q: "Which sports are covered?", a: "Major coverage includes football (Premier League, La Liga, Serie A, Champions League, World Cup), cricket (IPL, international), basketball (NBA), motorsport (F1, MotoGP), tennis, and MMA/UFC. Niche sports appear as streams become available." },
      { q: "Are matches available in HD?", a: "Where the source supports it, yes. Quality depends on the broadcaster's feed and your connection." },
      { q: "Can I see upcoming fixtures?", a: "Yes. Upcoming matches appear with kickoff time in your local timezone. Click a fixture to open its stream once it begins." },
      { q: "Is replay available after a match?", a: "Full-match replays depend on the source. Where available, they appear in the stream list for a limited window after the live broadcast ends." },
    ],
  },
};
