import { Button } from "@/components/ui/button";
import { FolderOpen, Plus } from "lucide-react";

interface NamespaceEmptyStateProps {
  onCreateNamespace?: () => void;
}

export function NamespaceEmptyState({
  onCreateNamespace,
}: NamespaceEmptyStateProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      role="status"
      aria-label="No namespaces"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FolderOpen
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No namespaces yet</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Create your first namespace to start organizing conversations for your
        team or company.
      </p>
      <Button className="mt-6" onClick={onCreateNamespace}>
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Create your first namespace
      </Button>
    </div>
  );
}
