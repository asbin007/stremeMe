import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

/**
 * `beforeinstallprompt` is Chromium-only and absent from the DOM lib, so the
 * event shape is declared here rather than escaping as `any`.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">Install AuraScreen</h4>
          <p className="text-xs text-gray-400 mt-0.5">Add to home screen for a better experience</p>
        </div>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className="flex-1 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
