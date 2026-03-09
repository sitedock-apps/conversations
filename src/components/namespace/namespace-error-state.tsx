import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface NamespaceErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function NamespaceErrorState({
  message,
  onRetry,
}: NamespaceErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 px-6 py-16"
      role="alert"
      aria-label="Error loading namespaces"
    >
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
