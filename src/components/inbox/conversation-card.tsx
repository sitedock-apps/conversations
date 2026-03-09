"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Conversation,
  formatConversationId,
  getConversationPath,
} from "@/types/inbox";
import { formatRelativeTime } from "@/lib/format-time";
import { MessageSquare, Crown } from "lucide-react";

interface ConversationCardProps {
  conversation: Conversation;
  isSelected?: boolean;
}

export function ConversationCard({
  conversation,
  isSelected = false,
}: ConversationCardProps) {
  const conversationId = formatConversationId(
    conversation.namespace.identifier,
    conversation.conversationNumber
  );
  const conversationPath = getConversationPath(
    conversation.namespace.identifier,
    conversation.conversationNumber
  );
  const initiatorName =
    conversation.initiator.name ?? conversation.initiator.email;

  return (
    <Link
      href={conversationPath}
      className={`group relative block rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSelected
          ? "border-primary/30 bg-accent/50"
          : "border-transparent"
      } ${conversation.hasUnread ? "bg-accent/20" : ""}`}
      aria-label={`${conversation.hasUnread ? "Unread conversation: " : ""}${conversationId} ${conversation.title}`}
    >
      {/* Unread indicator dot */}
      {conversation.hasUnread && (
        <span
          className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Left: ID + Title + Meta */}
        <div className="min-w-0 flex-1">
          {/* Top row: Conversation ID badge + Timestamp */}
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="shrink-0 font-mono text-[11px] font-semibold tracking-wide"
            >
              {conversationId}
            </Badge>
            {conversation.isManager && (
              <span
                className="flex items-center text-xs text-muted-foreground"
                title="You manage this conversation"
              >
                <Crown className="h-3 w-3" aria-hidden="true" />
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`truncate text-sm leading-snug ${
              conversation.hasUnread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/90"
            }`}
          >
            {conversation.title}
          </h3>

          {/* Initiator + Message count */}
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="truncate" title={conversation.initiator.email}>
              {initiatorName}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <MessageSquare className="h-3 w-3" aria-hidden="true" />
              {conversation.messageCount}
            </span>
          </div>
        </div>

        {/* Right: Timestamp */}
        <time
          dateTime={conversation.lastMessageAt}
          className={`shrink-0 text-xs ${
            conversation.hasUnread
              ? "font-medium text-primary"
              : "text-muted-foreground"
          }`}
        >
          {formatRelativeTime(conversation.lastMessageAt)}
        </time>
      </div>
    </Link>
  );
}
