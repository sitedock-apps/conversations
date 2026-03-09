"use client";

import { useState, useEffect, useCallback } from "react";
import { Conversation } from "@/types/inbox";
import { InboxSidebar } from "./inbox-sidebar";
import { InboxWelcomePanel } from "./inbox-welcome-panel";
import { toast } from "sonner";

/**
 * Fetches conversations from the real API endpoint.
 * Falls back to an error state if the API is unreachable.
 */
async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations?status=active&limit=50");

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Failed to load conversations (${response.status})`);
  }

  const data = await response.json();
  return data.conversations ?? [];
}

export function InboxView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load conversations. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewConversation = () => {
    toast.info("Create Conversation will be available in PROJ-3.");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {/* Sidebar: full width on mobile, fixed width on desktop */}
      <div className="h-full w-full shrink-0 md:w-80 lg:w-96">
        <InboxSidebar
          conversations={conversations}
          isLoading={isLoading}
          error={error}
          onNewConversation={handleNewConversation}
          onRetry={loadConversations}
        />
      </div>

      {/* Main content area: hidden on mobile (conversation list is full-screen),
          visible on desktop as the right panel */}
      <div className="hidden flex-1 md:block">
        <InboxWelcomePanel />
      </div>
    </div>
  );
}
