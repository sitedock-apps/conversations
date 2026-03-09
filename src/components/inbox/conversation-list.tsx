"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/types/inbox";
import { ConversationCard } from "./conversation-card";
import { ConversationCardSkeleton } from "./conversation-card-skeleton";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxErrorState } from "./inbox-error-state";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedConversationId?: string;
  onNewConversation?: () => void;
  onRetry?: () => void;
}

export function ConversationList({
  conversations,
  isLoading,
  error,
  selectedConversationId,
  onNewConversation,
  onRetry,
}: ConversationListProps) {
  if (error) {
    return <InboxErrorState message={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-1 p-2" aria-label="Loading conversations">
        {Array.from({ length: 5 }).map((_, i) => (
          <ConversationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return <InboxEmptyState onNewConversation={onNewConversation} />;
  }

  return (
    <ScrollArea className="h-full">
      <nav aria-label="Conversations" className="space-y-0.5 p-2">
        {conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedConversationId}
          />
        ))}
      </nav>
    </ScrollArea>
  );
}
