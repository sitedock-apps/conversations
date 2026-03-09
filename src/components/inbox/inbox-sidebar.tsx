"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Conversation } from "@/types/inbox";
import { ConversationList } from "./conversation-list";
import { Plus, Inbox } from "lucide-react";

interface InboxSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedConversationId?: string;
  onNewConversation?: () => void;
  onRetry?: () => void;
}

export function InboxSidebar({
  conversations,
  isLoading,
  error,
  selectedConversationId,
  onNewConversation,
  onRetry,
}: InboxSidebarProps) {
  const unreadCount = conversations.filter((c) => c.hasUnread).length;

  return (
    <aside
      className="flex h-full flex-col border-r bg-background"
      aria-label="Conversation inbox"
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-base font-semibold">Inbox</h2>
          {unreadCount > 0 && (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground"
              aria-label={`${unreadCount} unread conversation${unreadCount !== 1 ? "s" : ""}`}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={onNewConversation}
          aria-label="New conversation"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          <span className="hidden lg:inline">New</span>
        </Button>
      </div>

      <Separator />

      {/* Conversation list */}
      <div className="flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          error={error}
          selectedConversationId={selectedConversationId}
          onNewConversation={onNewConversation}
          onRetry={onRetry}
        />
      </div>
    </aside>
  );
}
