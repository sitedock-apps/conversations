/**
 * Types for the Conversation Inbox (PROJ-2).
 *
 * These interfaces define the shape of data used by inbox components.
 * They are designed to map cleanly to database models once the backend
 * is connected (PROJ-2 backend phase).
 */

export interface ConversationNamespace {
  /** UUID of the namespace */
  id: string;
  /** 5-character uppercase identifier, e.g. "ANTPC" */
  identifier: string;
  /** Human-readable namespace name */
  name: string;
}

export interface ConversationUser {
  /** UUID of the user */
  id: string;
  /** Email address (always available) */
  email: string;
  /** Display name (may be null for new users) */
  name: string | null;
}

export interface Conversation {
  /** UUID primary key */
  id: string;
  /** Sequential number within the namespace, e.g. 3 */
  conversationNumber: number;
  /** The namespace this conversation belongs to */
  namespace: ConversationNamespace;
  /** Conversation title */
  title: string;
  /** The user who created the conversation */
  initiator: ConversationUser;
  /** Total number of messages in this conversation */
  messageCount: number;
  /** Timestamp of the most recent message */
  lastMessageAt: string;
  /** Whether the current user has unread messages in this conversation */
  hasUnread: boolean;
  /** Whether the current user is the manager (initiator) of this conversation */
  isManager: boolean;
  /** Conversation status */
  status: "active" | "archived" | "closed";
  /** ISO timestamp of conversation creation */
  createdAt: string;
}

/**
 * Full conversation identifier string, e.g. "ANTPC-3".
 * Combines the namespace identifier with the conversation number.
 */
export function formatConversationId(
  namespaceIdentifier: string,
  conversationNumber: number
): string {
  return `${namespaceIdentifier}-${conversationNumber}`;
}

/**
 * URL path for a conversation, e.g. "/ANTPC/3".
 */
export function getConversationPath(
  namespaceIdentifier: string,
  conversationNumber: number
): string {
  return `/${namespaceIdentifier}/${conversationNumber}`;
}
