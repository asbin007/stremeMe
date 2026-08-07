import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import ClerkApiBridge from "./components/ClerkApiBridge";
import ClerkAuthSync from "./components/ClerkAuthSync";
import { clerkAppearance } from "./clerkAppearance";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById("root")!;

/**
 * Clerk is the only identity provider now, so the provider is unconditional.
 * It used to be skipped when the key was missing, which left `/login` and
 * `/register` rendering Clerk components with no provider above them — those
 * pages threw on mount and the whole route blanked.
 */
if (!PUBLISHABLE_KEY) {
  createRoot(rootElement).render(
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#030712",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "32rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Configuration error
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#94a3b8", lineHeight: 1.6 }}>
          <code>VITE_CLERK_PUBLISHABLE_KEY</code> is not set. Add it to the
          environment and rebuild — authentication cannot start without it.
        </p>
      </div>
    </div>
  );
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={clerkAppearance}
      >
        <ClerkApiBridge />
        <Provider store={store}>
          <ClerkAuthSync />
          <HelmetProvider>
            {/* Outer net: catches failures in the shell (navbar, footer,
                router) that the per-page boundary inside App sits below. */}
            <ErrorBoundary boundaryName="app shell">
              <App />
            </ErrorBoundary>
          </HelmetProvider>
        </Provider>
      </ClerkProvider>
    </StrictMode>
  );
}
