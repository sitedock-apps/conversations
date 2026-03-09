-- PROJ-2: Conversation Inbox (+ PROJ-3/PROJ-4 foundation tables)
-- Creates conversations, conversation_attendees, and messages tables.
-- These are the minimum tables needed to power the inbox query.
-- PROJ-3 (Create Conversation) will add the full creation API.

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  namespace_id UUID NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,
  conversation_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  initiator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Title must be non-empty and max 100 characters
  CONSTRAINT conversations_title_length CHECK (char_length(title) BETWEEN 1 AND 100),
  -- Status must be one of the allowed values
  CONSTRAINT conversations_status_check CHECK (status IN ('active', 'archived', 'closed')),
  -- Conversation number must be positive
  CONSTRAINT conversations_number_positive CHECK (conversation_number > 0),
  -- Unique conversation number within a namespace
  CONSTRAINT conversations_namespace_number_unique UNIQUE (namespace_id, conversation_number)
);

-- ============================================================
-- CONVERSATION ATTENDEES TABLE
-- ============================================================
CREATE TABLE conversation_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'attendee',
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Role must be one of the allowed values
  CONSTRAINT conversation_attendees_role_check CHECK (role IN ('manager', 'attendee')),
  -- A user can only be an attendee of a conversation once
  CONSTRAINT conversation_attendees_unique UNIQUE (conversation_id, user_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content must be non-empty and max 5000 characters
  CONSTRAINT messages_content_length CHECK (char_length(content) BETWEEN 1 AND 5000)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Conversations
CREATE INDEX idx_conversations_namespace_id ON conversations(namespace_id);
CREATE INDEX idx_conversations_initiator_id ON conversations(initiator_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Conversation Attendees
CREATE INDEX idx_conversation_attendees_user_id ON conversation_attendees(user_id);
CREATE INDEX idx_conversation_attendees_conversation_id ON conversation_attendees(conversation_id);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see conversations they are attending
CREATE POLICY "Attendees can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_attendees
      WHERE conversation_attendees.conversation_id = conversations.id
        AND conversation_attendees.user_id = auth.uid()
    )
  );

-- INSERT: Any authenticated user can create a conversation
-- (further validation in API route: must own or participate in the namespace)
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- UPDATE: Only the manager (initiator) can update a conversation
CREATE POLICY "Managers can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = initiator_id)
  WITH CHECK (auth.uid() = initiator_id);

-- No DELETE policy on conversations for now (PROJ-5 may add archiving)


-- CONVERSATION ATTENDEES
ALTER TABLE conversation_attendees ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see attendees of conversations they attend
CREATE POLICY "Attendees can view conversation attendees"
  ON conversation_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_attendees AS ca
      WHERE ca.conversation_id = conversation_attendees.conversation_id
        AND ca.user_id = auth.uid()
    )
  );

-- INSERT: Only the conversation manager can add attendees
CREATE POLICY "Managers can add attendees"
  ON conversation_attendees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_attendees.conversation_id
        AND conversations.initiator_id = auth.uid()
    )
  );

-- UPDATE: Attendees can update their own record (e.g. last_read_at)
CREATE POLICY "Attendees can update their own record"
  ON conversation_attendees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only the conversation manager can remove attendees
CREATE POLICY "Managers can remove attendees"
  ON conversation_attendees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_attendees.conversation_id
        AND conversations.initiator_id = auth.uid()
    )
  );


-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see messages in conversations they attend
CREATE POLICY "Attendees can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_attendees
      WHERE conversation_attendees.conversation_id = messages.conversation_id
        AND conversation_attendees.user_id = auth.uid()
    )
  );

-- INSERT: Attendees can send messages to their conversations
CREATE POLICY "Attendees can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_attendees
      WHERE conversation_attendees.conversation_id = messages.conversation_id
        AND conversation_attendees.user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE on messages for MVP (messages are immutable)


-- ============================================================
-- EXPAND NAMESPACE SELECT POLICY
-- Now that conversation_attendees exists, allow users to see
-- namespaces where they attend at least one conversation.
-- ============================================================
DROP POLICY "Owners can view their own namespaces" ON namespaces;

CREATE POLICY "Users can view namespaces they own or participate in"
  ON namespaces FOR SELECT
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1
      FROM conversations c
      JOIN conversation_attendees ca ON ca.conversation_id = c.id
      WHERE c.namespace_id = namespaces.id
        AND ca.user_id = auth.uid()
    )
  );
