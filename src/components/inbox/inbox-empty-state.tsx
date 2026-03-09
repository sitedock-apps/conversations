import { Button } from "@/components/ui/button";
import { Inbox, Plus } from "lucide-react";

interface InboxEmptyStateProps {
  onNewConversation?: () => void;
}

export function InboxEmptyState({ onNewConversation }: InboxEmptyStateProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      role="status"
      aria-label="No conversations"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No conversations yet</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Start a conversation to collaborate with your team. All messages stay
        organized in one place.
      </p>
      <Button className="mt-6" onClick={onNewConversation}>
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        New Conversation
      </Button>
    </div>
  );
}
