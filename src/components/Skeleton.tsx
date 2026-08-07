import React from "react";
import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      // Placeholders carry no information; announcing them just floods a screen
      // reader with empty nodes while content loads.
      aria-hidden="true"
      className={clsx(
        "bg-white/5 animate-pulse rounded-md ring-1 ring-white/10",
        className
      )}
    />
  );
};

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="w-full aspect-[2/3] rounded-lg overflow-hidden relative bg-secondary shadow-md">
      <Skeleton className="w-full h-full rounded-none" />
      <div className="absolute top-2 right-2 flex gap-1">
        <Skeleton className="w-8 h-4 rounded-sm" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <Skeleton className="w-3/4 h-5 mb-2" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[60vh] md:h-[80vh] rounded-2xl overflow-hidden relative bg-black/40">
      <Skeleton className="absolute inset-0 rounded-none w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 w-full md:w-2/3 lg:w-1/2">
        <Skeleton className="w-24 h-6 mb-4 rounded-full" />
        <Skeleton className="w-full h-12 md:h-20 mb-4" />
        
        <div className="flex gap-4 mb-6">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
        
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-11/12 h-4 mb-2" />
        <Skeleton className="w-4/5 h-4 mb-8" />
        
        <div className="flex gap-4">
          <Skeleton className="w-40 h-12 rounded-full" />
          <Skeleton className="w-40 h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const CarouselSkeleton: React.FC = () => {
  return (
    <div className="py-6 scroll-mt-24">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-24 h-6" />
      </div>
      
      <div className="flex gap-4 px-4 md:px-8 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex-none w-[160px] md:w-[200px] lg:w-[240px]">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white pb-12">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full bg-secondary/20">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 -mt-32 relative z-20 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-48 md:w-64 lg:w-80 flex-shrink-0 mx-auto md:mx-0 -mt-16 md:mt-0 relative">
            <Skeleton className="w-full aspect-[2/3] rounded-xl shadow-2xl" />
          </div>

          {/* Info */}
          <div className="flex-1 mt-4 md:mt-16 text-center md:text-left">
            <Skeleton className="w-3/4 h-10 md:h-16 mb-4 mx-auto md:mx-0" />
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-32 h-6 rounded-full" />
            </div>

            <div className="flex gap-2 justify-center md:justify-start mb-8">
              <Skeleton className="w-16 h-8 rounded-full" />
              <Skeleton className="w-16 h-8 rounded-full" />
              <Skeleton className="w-16 h-8 rounded-full" />
            </div>

            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-11/12 h-4 mb-2" />
            <Skeleton className="w-4/5 h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-8" />

            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
              <Skeleton className="w-48 h-12 rounded-full" />
              <Skeleton className="w-48 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LiveTVSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[80vh] min-h-[600px] w-full">
      <div className="w-full lg:w-2/3 flex flex-col h-full">
        <Skeleton className="w-full pt-[56.25%] rounded-3xl" />
        <div className="mt-6 p-6 rounded-3xl bg-secondary/20 flex items-center gap-6">
           <Skeleton className="w-20 h-20 rounded-2xl" />
           <div className="flex-1">
             <Skeleton className="w-24 h-4 mb-2" />
             <Skeleton className="w-48 h-8 mb-2" />
             <Skeleton className="w-16 h-6 rounded-full" />
           </div>
        </div>
      </div>
      <div className="w-full lg:w-1/3 flex flex-col bg-secondary/20 rounded-3xl p-6 h-full">
        <div className="flex justify-between items-center mb-6">
           <Skeleton className="w-32 h-8" />
           <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
             <div key={i} className="flex gap-4 items-center">
               <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
               <div className="flex-1">
                 <Skeleton className="w-3/4 h-5 mb-2" />
                 <Skeleton className="w-1/2 h-3" />
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

