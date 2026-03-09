"use client";

import { NamespaceCard } from "./namespace-card";
import { NamespaceCardSkeleton } from "./namespace-card-skeleton";
import { NamespaceEmptyState } from "./namespace-empty-state";
import { NamespaceErrorState } from "./namespace-error-state";
import type { Namespace } from "@/types/namespace";

interface NamespaceListProps {
  namespaces: Namespace[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
  onCreateNamespace: () => void;
  onEditNamespace: (namespace: Namespace) => void;
  onRetry: () => void;
}

export function NamespaceList({
  namespaces,
  currentUserId,
  isLoading,
  error,
  onCreateNamespace,
  onEditNamespace,
  onRetry,
}: NamespaceListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading namespaces"
        role="status"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <NamespaceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return <NamespaceErrorState message={error} onRetry={onRetry} />;
  }

  // Empty state
  if (namespaces.length === 0) {
    return <NamespaceEmptyState onCreateNamespace={onCreateNamespace} />;
  }

  // Namespace grid
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Namespaces"
    >
      {namespaces.map((namespace) => (
        <div key={namespace.id} role="listitem">
          <NamespaceCard
            namespace={namespace}
            isOwner={namespace.owner_id === currentUserId}
            onEdit={onEditNamespace}
          />
        </div>
      ))}
    </div>
  );
}
