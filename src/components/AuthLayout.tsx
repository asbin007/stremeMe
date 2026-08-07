import type { ReactNode } from "react";
import Logo from "./Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Shared frame for the sign-in and sign-up routes so both pages share one
 * background treatment, heading rhythm, and mobile spacing.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12 sm:py-16">
      {/* Ambient background. Purely decorative, so it is hidden from
          assistive tech and does not intercept pointer events. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-15%] top-[-15%] size-[45%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-15%] size-[45%] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <Logo size="lg" />

        <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-text-muted">{subtitle}</p>

        <div className="mt-8 w-full">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
