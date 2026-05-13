import React from "react";

const providers = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    bgUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: "prime",
    name: "Prime Video",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    bgUrl: "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: "disney",
    name: "Disney+",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    bgUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdf9e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "hulu",
    name: "Hulu",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg",
    bgUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "hbo",
    name: "HBO Max",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
    bgUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
  },
  {
    id: "apple",
    name: "Apple TV+",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
    bgUrl: "https://images.unsplash.com/photo-1535016120720-40c746a6580b?q=80&w=2070&auto=format&fit=crop",
  },
];

const NetworkProviders: React.FC = () => {
  return (
    <div className="py-6 md:py-8 px-4 md:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-6">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="group relative aspect-video md:aspect-auto md:h-32 rounded-md md:rounded-xl overflow-hidden cursor-pointer shadow-md md:shadow-lg transition-transform duration-300 md:hover:scale-105 md:hover:shadow-xl border border-white/10 bg-secondary/50 active:scale-95"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-30">
              <img
                src={provider.bgUrl}
                alt={`${provider.name} background`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 group-hover:from-black/90 transition-all duration-300" />
            
            <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
              <img
                src={provider.logo}
                alt={provider.name}
                className="w-3/4 md:w-4/5 max-h-8 md:max-h-12 object-contain transition-transform duration-300 md:group-hover:scale-110 drop-shadow-md filter brightness-0 invert"
                style={{ 
                    filter: provider.id === 'netflix' || provider.id === 'hulu' || provider.id === 'prime' ? 'none' : 'invert(1)', 
                    opacity: 0.9 
                }}
              />
            </div>
            
            {/* Glossy overlay effect like Apple/Netflix TV apps */}
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/5 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkProviders;