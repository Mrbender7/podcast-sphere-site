import { Skeleton } from "@/components/ui/skeleton";

export function PodcastCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[105px]">
      <Skeleton className="aspect-square rounded-xl mb-2" />
      <Skeleton className="h-3 w-4/5 mb-1" />
      <Skeleton className="h-2.5 w-3/5" />
    </div>
  );
}

export function PodcastRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

export function EpisodeRowSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-2/5" />
      </div>
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    </div>
  );
}

export function TrendingRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <PodcastCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <PodcastRowSkeleton key={i} />
      ))}
    </div>
  );
}
