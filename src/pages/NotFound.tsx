import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-4">
          404
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Page not found</h1>
        <p className="text-text/70 mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
