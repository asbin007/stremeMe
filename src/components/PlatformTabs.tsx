import React from "react";
import clsx from "clsx";

// TMDB provider IDs for the US watch_region. Add/remove rows to change the
// tab set. Keep the "All" chip (null id) first so the default view matches
// the pre-tabs behavior.
export const PLATFORMS: { id: number | null; name: string; color: string }[] = [
  { id: null,  name: "All",          color: "bg-accent" },
  { id: 8,     name: "Netflix",      color: "bg-[#E50914]" },
  { id: 9,     name: "Prime Video",  color: "bg-[#00A8E1]" },
  { id: 337,   name: "Disney+",      color: "bg-[#113CCF]" },
  { id: 15,    name: "Hulu",         color: "bg-[#1CE783] text-black" },
  { id: 1899,  name: "Max",          color: "bg-[#002BE7]" },
  { id: 350,   name: "Apple TV+",    color: "bg-[#000000] border border-white/20" },
  { id: 283,   name: "Crunchyroll",  color: "bg-[#F47521]" },
  { id: 531,   name: "Paramount+",   color: "bg-[#0064FF]" },
  { id: 386,   name: "Peacock",      color: "bg-[#000000] border border-white/20" },
];

interface Props {
  selected: number | null;
  onSelect: (id: number | null) => void;
}

const PlatformTabs: React.FC<Props> = ({ selected, onSelect }) => (
  <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
    {PLATFORMS.map((p) => {
      const active = p.id === selected;
      return (
        <button
          key={String(p.id)}
          type="button"
          onClick={() => onSelect(p.id)}
          aria-pressed={active}
          className={clsx(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
            active
              ? `${p.color} text-white shadow-lg`
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {p.name}
        </button>
      );
    })}
  </div>
);

export default PlatformTabs;
