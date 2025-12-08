import React, { useEffect, useRef } from "react";

const NativeAd: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script is already present to prevent duplicates on re-renders
    if (containerRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "//pl28214418.effectivegatecpm.com/35dba6dd932a33d63404775e61f7e56f/invoke.js";

    const adContainer = document.createElement("div");
    adContainer.id = "container-35dba6dd932a33d63404775e61f7e56f";

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(adContainer);

    return () => {
      // Cleanup if necessary, though these ads often append globally
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center py-6 my-4 bg-secondary/10">
      <div ref={containerRef} className="min-h-[90px] w-full max-w-[728px]" />
    </div>
  );
};

export default NativeAd;
