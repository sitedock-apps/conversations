"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Namespace } from "@/types/namespace";

interface NamespaceCardProps {
  namespace: Namespace;
  isOwner: boolean;
  onEdit?: (namespace: Namespace) => void;
}

export function NamespaceCard({
  namespace,
  isOwner,
  onEdit,
}: NamespaceCardProps) {
  return (
    <Card
      className="group h-full transition-colors hover:border-primary/30"
      role="article"
      aria-label={`Namespace ${namespace.identifier}: ${namespace.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1.5">
            <Badge
              className="font-mono text-xs font-bold tracking-widest"
              aria-label={`Identifier: ${namespace.identifier}`}
            >
              {namespace.identifier}
            </Badge>
            <h3 className="truncate text-base font-semibold leading-snug">
              {namespace.name}
            </h3>
          </div>
          {isOwner && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              onClick={() => onEdit(namespace)}
              aria-label={`Edit namespace ${namespace.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>
      {namespace.description && (
        <CardContent className="pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {namespace.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
