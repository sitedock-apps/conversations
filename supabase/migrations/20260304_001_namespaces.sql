-- PROJ-7: Namespace Management
-- Creates the namespaces table with RLS policies.
-- No DELETE policy: namespaces are permanently undeletable.

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- NAMESPACES TABLE
-- ============================================================
CREATE TABLE namespaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identifier must be exactly 5 uppercase alphanumeric characters
  CONSTRAINT namespaces_identifier_format CHECK (identifier ~ '^[A-Z0-9]{5}$'),
  -- Name must be non-empty and max 50 characters
  CONSTRAINT namespaces_name_length CHECK (char_length(name) BETWEEN 1 AND 50),
  -- Description max 200 characters (nullable)
  CONSTRAINT namespaces_description_length CHECK (description IS NULL OR char_length(description) <= 200),
  -- Identifier must be globally unique
  CONSTRAINT namespaces_identifier_unique UNIQUE (identifier)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_namespaces_owner_id ON namespaces(owner_id);
CREATE INDEX idx_namespaces_identifier ON namespaces(identifier);
CREATE INDEX idx_namespaces_created_at ON namespaces(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE namespaces ENABLE ROW LEVEL SECURITY;

-- SELECT: Owner can see their own namespaces.
-- Phase 2 (PROJ-3) will expand this to include namespaces where the user
-- is an attendee of at least one conversation.
CREATE POLICY "Owners can view their own namespaces"
  ON namespaces FOR SELECT
  USING (auth.uid() = owner_id);

-- INSERT: Any authenticated user can create a namespace.
-- The server-side rate limit (max 3 per user) is enforced in the API route,
-- not in RLS, so it can be adjusted as a pro feature later.
CREATE POLICY "Authenticated users can create namespaces"
  ON namespaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Only the owner can update their namespace.
-- The identifier column is protected from changes at the API level.
CREATE POLICY "Owners can update their own namespaces"
  ON namespaces FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- No DELETE policy: namespaces are permanently undeletable.

-- ============================================================
-- SECURITY DEFINER FUNCTION FOR IDENTIFIER AVAILABILITY CHECK
-- ============================================================
-- This function bypasses RLS to check if an identifier is taken
-- across ALL namespaces, not just ones visible to the current user.
-- It only returns a boolean -- no data is leaked.
CREATE OR REPLACE FUNCTION check_namespace_identifier_available(check_identifier TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM namespaces WHERE identifier = check_identifier
  );
END;
$$;
