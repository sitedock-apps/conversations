import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

interface InboxErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function InboxErrorState({
  message = "Failed to load conversations. Please try again.",
  onRetry,
}: InboxErrorStateProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-16"
      role="alert"
    >
      <Alert variant="destructive" className="max-w-sm">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}
