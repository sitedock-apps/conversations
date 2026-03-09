import { Skeleton } from "@/components/ui/skeleton";

export function ConversationCardSkeleton() {
  return (
    <div className="rounded-lg px-4 py-3" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* ID badge skeleton */}
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Title skeleton */}
          <Skeleton className="h-4 w-3/4" />
          {/* Meta row skeleton */}
          <div className="mt-1.5 flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
        {/* Timestamp skeleton */}
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}
