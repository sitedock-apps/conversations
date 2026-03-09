import { Conversation } from "@/types/inbox";

/**
 * Mock conversations for PROJ-2 Conversation Inbox.
 *
 * Uses realistic data with multiple namespaces and varying states
 * to exercise all UI conditions: unread, read, manager vs attendee,
 * different namespaces, varied message counts and timestamps.
 *
 * This file will be replaced by real API calls once the backend is built.
 */

const MOCK_NAMESPACES = {
  anthropic: {
    id: "ns-001",
    identifier: "ANTPC",
    name: "Anthropic",
  },
  acme: {
    id: "ns-002",
    identifier: "ACME1",
    name: "Acme Corp",
  },
  design: {
    id: "ns-003",
    identifier: "DSGNX",
    name: "DesignX Studio",
  },
};

const MOCK_USERS = {
  currentUser: {
    id: "user-001",
    email: "me@example.com",
    name: "Current User",
  },
  alice: {
    id: "user-002",
    email: "alice@anthropic.com",
    name: "Alice Chen",
  },
  bob: {
    id: "user-003",
    email: "bob@acme.com",
    name: "Bob Martinez",
  },
  carol: {
    id: "user-004",
    email: "carol@designx.io",
    name: "Carol Wu",
  },
  dave: {
    id: "user-005",
    email: "dave@anthropic.com",
    name: null, // New user, no name set - tests email fallback
  },
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-001",
    conversationNumber: 3,
    namespace: MOCK_NAMESPACES.anthropic,
    title: "Q2 Product Roadmap Planning",
    initiator: MOCK_USERS.alice,
    messageCount: 24,
    lastMessageAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 min ago
    hasUnread: true,
    isManager: false,
    status: "active",
    createdAt: "2026-02-28T10:00:00Z",
  },
  {
    id: "conv-002",
    conversationNumber: 7,
    namespace: MOCK_NAMESPACES.anthropic,
    title: "API Rate Limiting Discussion",
    initiator: MOCK_USERS.currentUser,
    messageCount: 8,
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    hasUnread: false,
    isManager: true,
    status: "active",
    createdAt: "2026-03-01T14:30:00Z",
  },
  {
    id: "conv-003",
    conversationNumber: 1,
    namespace: MOCK_NAMESPACES.acme,
    title: "Website Redesign Kickoff",
    initiator: MOCK_USERS.bob,
    messageCount: 42,
    lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    hasUnread: true,
    isManager: false,
    status: "active",
    createdAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "conv-004",
    conversationNumber: 2,
    namespace: MOCK_NAMESPACES.acme,
    title: "Invoice #1042 Follow-up",
    initiator: MOCK_USERS.currentUser,
    messageCount: 3,
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    hasUnread: false,
    isManager: true,
    status: "active",
    createdAt: "2026-03-02T16:00:00Z",
  },
  {
    id: "conv-005",
    conversationNumber: 5,
    namespace: MOCK_NAMESPACES.design,
    title: "Brand Guidelines Review",
    initiator: MOCK_USERS.carol,
    messageCount: 15,
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    hasUnread: true,
    isManager: false,
    status: "active",
    createdAt: "2026-02-20T11:00:00Z",
  },
  {
    id: "conv-006",
    conversationNumber: 12,
    namespace: MOCK_NAMESPACES.anthropic,
    title: "Onboarding Checklist for New Hires",
    initiator: MOCK_USERS.dave, // User with no name set
    messageCount: 6,
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    hasUnread: false,
    isManager: false,
    status: "active",
    createdAt: "2026-02-25T08:00:00Z",
  },
  {
    id: "conv-007",
    conversationNumber: 9,
    namespace: MOCK_NAMESPACES.design,
    title: "Icon Set Delivery - Final Round",
    initiator: MOCK_USERS.currentUser,
    messageCount: 31,
    lastMessageAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    hasUnread: false,
    isManager: true,
    status: "active",
    createdAt: "2026-02-10T13:00:00Z",
  },
  {
    id: "conv-008",
    conversationNumber: 4,
    namespace: MOCK_NAMESPACES.acme,
    title: "Contract Renewal Terms",
    initiator: MOCK_USERS.bob,
    messageCount: 11,
    lastMessageAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    hasUnread: false,
    isManager: false,
    status: "active",
    createdAt: "2026-02-18T10:00:00Z",
  },
];

/**
 * Simulates an API call to fetch conversations.
 * Returns conversations sorted by lastMessageAt (descending).
 * Filters out archived/closed conversations by default.
 */
export async function fetchMockConversations(): Promise<Conversation[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  return MOCK_CONVERSATIONS.filter((c) => c.status === "active").sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() -
      new Date(a.lastMessageAt).getTime()
  );
}
