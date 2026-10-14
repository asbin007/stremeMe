import { Link } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";

// Rich 404: the dead-end page used to show one button and nothing else, so
// Google read a bounce and users clicked away. A grid of first-party links to
// every top section lets both the crawler and the viewer recover without
// having to go home first.
const QUICK_LINKS: { label: string; to: string; blurb: string }[] = [
  { label: "Trending Movies", to: "/movies", blurb: "What everyone is watching this week" },
  { label: "Popular TV Shows", to: "/tv-shows", blurb: "Full series, all seasons" },
  { label: "Anime", to: "/anime", blurb: "Subbed & dubbed anime library" },
  { label: "Live TV", to: "/live-tv", blurb: "Hundreds of free channels" },
  { label: "Hindi Movies", to: "/hindi-movies", blurb: "Bollywood & regional cinema" },
  { label: "Search", to: "/search", blurb: "Find anything by title or actor" },
];

function NotFound() {
  return (
    <section className="min-h-[70vh] px-4 py-16">
      <SEOHead title="404 — Page Not Found | AuraScreen" noindex={true} />
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
          404
        </p>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Page not found</h1>
        <p className="mb-10 text-text/70">
          The page you are looking for does not exist or may have been moved.
          Try one of these instead:
        </p>

        <ul className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-accent/50 hover:bg-white/10"
              >
                <p className="font-semibold text-white">{link.label}</p>
                <p className="mt-1 text-sm text-text/60">{link.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
