/**
 * Shared shapes for TMDB payloads.
 *
 * Pages used to annotate every `.map`/`.filter` callback as `any`, which meant
 * a typo in a field name compiled fine and rendered `undefined`. `MediaItem`
 * covers both movies and TV: TMDB returns `title`/`release_date` for films and
 * `name`/`first_air_date` for series, and mixed endpoints (trending, multi
 * search) return both in one array.
 */
export interface MediaItem {
  id: number;
  media_type?: 'movie' | 'tv' | 'person';
  /** Films. */
  title?: string;
  /** Series. */
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  original_language?: string;
}

/** Title for either kind of media, with a safe fallback for rendering. */
export function getMediaTitle(item: MediaItem): string {
  return item.title || item.name || 'Untitled';
}

/** Release year as a string, or an empty string when TMDB has no date. */
export function getMediaYear(item: MediaItem): string {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : '';
}

/** Narrows a mixed result list to the entries this app can route to. */
export function isPlayableMedia(
  item: MediaItem
): item is MediaItem & { media_type: 'movie' | 'tv' } {
  return item.media_type === 'movie' || item.media_type === 'tv';
}

/**
 * Adapts a TMDB result to `MovieCard`'s props.
 *
 * TMDB omits `title` on series, `name` on films, and `poster_path` on plenty of
 * entries. Those call sites were previously typed `any`, so the missing fields
 * reached the DOM as `undefined` — an empty heading and a broken image. Person
 * results are collapsed to `movie` here; filter them out with `isPlayableMedia`
 * before mapping if they can appear in the list.
 */
export function toMovieCardProps(item: MediaItem): {
  id: number;
  title: string;
  posterUrl: string;
  type: 'movie' | 'tv';
} {
  return {
    id: item.id,
    title: getMediaTitle(item),
    posterUrl: item.poster_path || item.backdrop_path || '',
    type: item.media_type === 'tv' ? 'tv' : 'movie',
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoResult {
  id?: string;
  key: string;
  site: string;
  type: string;
  name?: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface PaginatedResults<T = MediaItem> {
  page: number;
  results: T[];
  total_pages: number;
  total_results?: number;
}
