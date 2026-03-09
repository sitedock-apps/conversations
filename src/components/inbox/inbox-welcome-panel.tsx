import { MessageSquare } from "lucide-react";

export function InboxWelcomePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageSquare
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Select a conversation</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Choose a conversation from the sidebar to view its messages, or start a
        new one.
      </p>
    </div>
  );
}
