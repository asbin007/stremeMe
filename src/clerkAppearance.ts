import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/react";

/** Derived from the provider so it tracks Clerk's own type across upgrades. */
type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/**
 * Shared Clerk theming, applied once at the provider so every Clerk surface
 * (sign-in, sign-up, user button, user profile) matches the app.
 *
 * This used to be duplicated inline on the sign-in page only, where it also
 * mismatched the design system — the primary button was the cyan accent but
 * hovered to red, and `<UserButton>` inherited Clerk's default light styling
 * against a near-black page.
 *
 * Values mirror the tokens in `index.css`.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#06b6d4", // --color-accent
    colorPrimaryForeground: "#0a0a0a", // --color-primary, legible on cyan
    colorBackground: "#111827", // --color-surface
    colorForeground: "#f8fafc", // --color-text
    colorMutedForeground: "#94a3b8", // --color-text-muted
    colorInput: "rgba(0, 0, 0, 0.25)",
    colorInputForeground: "#f8fafc",
    colorBorder: "rgba(255, 255, 255, 0.1)",
    colorModalBackdrop: "rgba(3, 7, 18, 0.8)", // --color-background, translucent
    colorDanger: "#ef4444", // --color-error
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    fontFamily: '"Inter", system-ui, sans-serif',
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-2xl",
    card: "bg-surface/70 backdrop-blur-xl border border-white/10",
    headerTitle: "text-text",
    headerSubtitle: "text-text-muted",
    socialButtonsBlockButton:
      "bg-white/5 border border-white/10 text-text hover:bg-white/10 transition-colors",
    dividerLine: "bg-white/10",
    dividerText: "text-text-muted",
    formFieldLabel: "text-text-muted",
    formFieldInput:
      "bg-black/25 border border-white/10 text-text placeholder:text-text-muted/60",
    formButtonPrimary:
      "bg-accent text-primary font-medium hover:bg-accent-hover transition-colors",
    footerActionText: "text-text-muted",
    footerActionLink: "text-accent hover:text-accent-hover",
    identityPreviewText: "text-text",
    identityPreviewEditButton: "text-accent hover:text-accent-hover",
    userButtonPopoverCard:
      "bg-surface border border-white/10 shadow-2xl backdrop-blur-xl",
    userButtonPopoverActionButton: "text-text hover:bg-white/5",
    userButtonPopoverActionButtonText: "text-text",
    userButtonPopoverFooter: "hidden",
  },
};

export default clerkAppearance;
