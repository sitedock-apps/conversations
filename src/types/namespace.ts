/**
 * Types for Namespace Management (PROJ-7).
 *
 * These interfaces define the shape of data returned by the
 * namespace API endpoints and used by namespace components.
 */

export interface Namespace {
  /** UUID primary key */
  id: string;
  /** 5-character uppercase identifier, e.g. "ANTPC" */
  identifier: string;
  /** Human-readable namespace name */
  name: string;
  /** Optional description (max 200 chars) */
  description: string | null;
  /** UUID of the namespace owner */
  owner_id: string;
  /** ISO timestamp of creation */
  created_at: string;
}

/**
 * Input for creating a new namespace.
 */
export interface CreateNamespaceInput {
  name: string;
  identifier: string;
  description?: string | null;
}

/**
 * Input for updating a namespace (name and/or description only).
 */
export interface UpdateNamespaceInput {
  name?: string;
  description?: string | null;
}

/**
 * Response from the identifier availability check endpoint.
 */
export interface IdentifierCheckResult {
  identifier: string;
  available: boolean;
}
