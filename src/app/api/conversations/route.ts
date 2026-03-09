import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/conversations
 * Fetch all conversations for the authenticated user's inbox.
 *
 * Returns conversations the user attends, sorted by most recent message
 * activity (descending). Includes namespace info, initiator info,
 * message count, and unread status.
 *
 * Query params:
 * - status: Filter by status (default: "active")
 * - limit: Max conversations to return (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "active";
  const limitParam = parseInt(searchParams.get("limit") || "20", 10);
  const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

  // Validate and clamp parameters
  const limit = Math.min(Math.max(1, limitParam), 100);
  const offset = Math.max(0, offsetParam);

  if (!["active", "archived", "closed"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be one of: active, archived, closed" },
      { status: 400 }
    );
  }

  // Fetch conversations the user attends with related data via Supabase joins.
  // RLS on conversations table ensures only attended conversations are returned.
  // The !inner join on conversation_attendees ensures we only get conversations
  // where the current user is an attendee.
  const { data: conversations, error: fetchError } = await supabase
    .from("conversations")
    .select(
      `
      id,
      conversation_number,
      title,
      status,
      created_at,
      initiator_id,
      namespace:namespaces!namespace_id (
        id,
        identifier,
        name
      ),
      conversation_attendees!inner (
        user_id,
        role,
        last_read_at
      ),
      initiator:profiles!initiator_id (
        id,
        email,
        name
      )
    `
    )
    .eq("status", status)
    .eq("conversation_attendees.user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (fetchError) {
    console.error("Failed to fetch conversations:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }

  // For each conversation, fetch message count and last message timestamp.
  // We batch all conversation IDs into a single query to avoid N+1.
  const conversationIds = conversations.map((c) => c.id);

  let messageStats: Record<
    string,
    { count: number; last_message_at: string | null }
  > = {};

  if (conversationIds.length > 0) {
    // Fetch all messages for these conversations in one query
    // Only select the fields we need for counting and finding latest
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("conversation_id, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    if (msgError) {
      console.error("Failed to fetch message stats:", msgError);
      // Non-fatal: conversations still returned with count=0
    } else if (messages) {
      for (const msg of messages) {
        if (!messageStats[msg.conversation_id]) {
          messageStats[msg.conversation_id] = {
            count: 0,
            last_message_at: msg.created_at,
          };
        }
        messageStats[msg.conversation_id].count += 1;
      }
    }
  }

  // Transform into the response format matching the frontend Conversation type
  const formattedConversations = conversations.map((conv) => {
    // Get the current user's attendee record
    const attendeeRecord = Array.isArray(conv.conversation_attendees)
      ? conv.conversation_attendees[0]
      : conv.conversation_attendees;

    const stats = messageStats[conv.id] || {
      count: 0,
      last_message_at: null,
    };

    const lastReadAt = attendeeRecord?.last_read_at;
    const lastMessageAt = stats.last_message_at || conv.created_at;

    // Determine unread status: has messages newer than last_read_at
    const hasUnread = lastReadAt
      ? new Date(lastMessageAt) > new Date(lastReadAt)
      : stats.count > 0;

    const isManager = attendeeRecord?.role === "manager";

    // Handle namespace from Supabase join (single object or array)
    const namespace = Array.isArray(conv.namespace)
      ? conv.namespace[0]
      : conv.namespace;

    // Handle initiator from Supabase join (single object or array)
    const initiator = Array.isArray(conv.initiator)
      ? conv.initiator[0]
      : conv.initiator;

    return {
      id: conv.id,
      conversationNumber: conv.conversation_number,
      namespace: namespace
        ? {
            id: namespace.id,
            identifier: namespace.identifier,
            name: namespace.name,
          }
        : null,
      title: conv.title,
      initiator: initiator
        ? {
            id: initiator.id,
            email: initiator.email,
            name: initiator.name,
          }
        : {
            id: conv.initiator_id,
            email: "Unknown",
            name: null,
          },
      messageCount: stats.count,
      lastMessageAt,
      hasUnread,
      isManager,
      status: conv.status,
      createdAt: conv.created_at,
    };
  });

  // Sort by lastMessageAt descending (most recent activity first)
  formattedConversations.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() -
      new Date(a.lastMessageAt).getTime()
  );

  return NextResponse.json({
    conversations: formattedConversations,
    pagination: {
      offset,
      limit,
      total: formattedConversations.length,
    },
  });
}
