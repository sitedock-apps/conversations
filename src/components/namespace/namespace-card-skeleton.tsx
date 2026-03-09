import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NamespaceCardSkeleton() {
  return (
    <Card className="h-full" aria-hidden="true">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            {/* Identifier badge skeleton */}
            <Skeleton className="h-5 w-16 rounded-full" />
            {/* Name skeleton */}
            <Skeleton className="h-5 w-32" />
          </div>
          {/* Edit button skeleton */}
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}
