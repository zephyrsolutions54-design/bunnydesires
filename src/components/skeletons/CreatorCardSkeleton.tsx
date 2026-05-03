import { Skeleton } from "@/components/ui/skeleton";

export function CreatorCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50">
      {/* Image placeholder */}
      <Skeleton className="aspect-[4/5] w-full" />

      {/* Content */}
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-3" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3 mb-4" />

        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CreatorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CreatorCardSkeleton key={i} />
      ))}
    </div>
  );
}
