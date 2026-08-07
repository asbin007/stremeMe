import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional label so logs identify which part of the tree failed. */
  boundaryName?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so a single bad page cannot blank the whole app.
 *
 * React has no hook equivalent for this — an error boundary must be a class.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `Unhandled error in ${this.props.boundaryName ?? "component tree"}:`,
      error,
      info.componentStack
    );
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-text">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          This page ran into an unexpected problem. Trying again usually fixes
          it — if it keeps happening, head back home.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-6 max-w-full overflow-x-auto rounded-lg bg-surface p-4 text-left text-xs text-error">
            {error.message}
          </pre>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Home className="size-4" aria-hidden="true" />
            Go home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
