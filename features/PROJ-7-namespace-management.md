# PROJ-7: Namespace Management

## Status: In Progress
**Created:** 2026-03-03
**Last Updated:** 2026-03-04

## Dependencies
- Requires: PROJ-1 (User Authentication) — only logged-in users can create or manage namespaces
- Required by: PROJ-3 (Create Conversation) — conversation creation must include namespace selection
- Required by: PROJ-8 (Namespace-scoped Inbox) — inbox grouping depends on namespaces existing

## User Stories
- As a logged-in user, I want to create a namespace for my company or team so that I can group all related conversations under one identity.
- As a namespace creator, I want to give my namespace a unique name and a short identifier (slug) so that it is recognizable and linkable.
- As a namespace creator, I want to edit my namespace's name and description after creation so that I can keep it up to date.
- As a logged-in user, I want to see all namespaces I participate in (through my conversations) so that I can quickly switch between contexts.
- As a conversation creator, I want to select which namespace a new conversation belongs to so that it is organized correctly from the start.
- As a user, I want to see which namespace a conversation belongs to when I read or reply to it so that I always know the context.

## Acceptance Criteria
- [ ] Any logged-in user can create a new namespace from the app
- [ ] A namespace requires a name (non-empty, max 50 characters) and a unique 5-character identifier (uppercase letters and digits only, e.g. `ANTPC`)
- [ ] A namespace optionally accepts a short description (max 200 characters)
- [ ] The 5-character identifier is automatically suggested from the name (e.g. "Anthropic" → "ANTPC") but can be manually overridden before creation
- [ ] The identifier input enforces exactly 5 characters, uppercase letters and digits only (A–Z, 0–9); lowercase input is auto-uppercased
- [ ] Namespace identifiers must be globally unique — creating a duplicate shows a clear inline error: "This identifier is already taken" with an alternative suggestion
- [ ] The creator of a namespace is stored as its owner
- [ ] The namespace owner can edit the name and description (but not the identifier after creation)
- [ ] A namespace is visible to any user who is an attendee of at least one conversation in that namespace
- [ ] Non-attendees cannot discover or access a namespace or its conversations
- [ ] The namespace identifier is used as its URL segment (e.g. `/ANTPC`)
- [ ] When creating a conversation (PROJ-3), the user must select a namespace from the list of namespaces they own or participate in, or create a new one inline
- [ ] The conversation's namespace identifier is displayed in the conversation feed header (PROJ-4)
- [ ] A user with no namespaces is prompted to create one before starting their first conversation

## Edge Cases
- What if a user tries to create a namespace with an identifier already taken? → Show inline error: "This identifier is already taken" and suggest an alternative 5-char code
- What if the auto-suggested identifier collides? → Append a digit or swap a character until a free code is found; surface the suggestion to the user
- What if the namespace owner deletes their account? → Namespace remains; conversations are preserved; ownership is unassigned (handle in a future admin feature)
- What if a user is removed from all conversations in a namespace? → Namespace disappears from their list (they no longer have access)
- What if two users create namespaces with the same name but different identifiers? → Allowed — names don't need to be unique, only identifiers do
- What if a user tries to create a conversation without any namespace existing? → Prompt to create a namespace first (or create one inline during conversation creation)
- What if the namespace name is shorter than 5 characters? → Pad the suggestion with digits (e.g. "ABC" → "ABC01")
- What if the namespace name contains only special characters? → Fall back to a random 5-char alphanumeric code and prompt the user to confirm or change it

## Technical Requirements
- Identifier validation: Enforce uniqueness at the database level (unique constraint); pattern `^[A-Z0-9]{5}$`
- Security: Namespace details only accessible to users who are attendees of at least one conversation in it
- Identifier immutability: Identifiers cannot be changed after creation to prevent broken links and broken conversation IDs

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Screen & Component Structure

```
/namespaces  (protected page, requires login)
├── AppHeader  (existing — add "Namespaces" nav link)
└── Page Body
    ├── Page Header
    │   ├── Title: "Namespaces"
    │   └── "New Namespace" Button  →  opens CreateNamespaceDialog
    ├── NamespaceList
    │   ├── NamespaceCard  (×N, one per namespace)
    │   │   ├── Identifier Badge  (e.g. "ANTPC", accent color)
    │   │   ├── Name  (heading)
    │   │   ├── Description  (optional, muted text)
    │   │   └── Edit Button  (visible to owner only)  →  opens EditNamespaceDialog
    │   └── EmptyState  (shown when user has 0 namespaces)
    │       └── "Create your first namespace" prompt + button
    ├── CreateNamespaceDialog  (modal)
    │   ├── Name Input  (triggers identifier suggestion on change)
    │   ├── Identifier Input  (5-char, auto-uppercased, editable)
    │   │   └── Availability Indicator  (✓ Available · ✗ Already taken)
    │   ├── Description Textarea  (optional)
    │   └── Create Button  (disabled until identifier is valid + available)
    └── EditNamespaceDialog  (modal)
        ├── Identifier  (read-only badge — not an input)
        ├── Name Input  (pre-filled)
        ├── Description Textarea  (pre-filled, optional)
        └── Save Button
```

### Data Model

**`namespaces` table** (Supabase / PostgreSQL):

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `identifier` | Text | Exactly 5 chars, `A-Z0-9`, **unique**, **immutable**, indexed |
| `name` | Text | Max 50 chars, required |
| `description` | Text | Max 200 chars, optional |
| `owner_id` | UUID | References `auth.users`, set on creation, never changes |
| `created_at` | Timestamp | Auto-set by database |

No separate membership table is needed. Namespace visibility for non-owners is derived from `conversation_attendees` (added in PROJ-3). For PROJ-7 only, owners see their own namespaces.

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/namespaces` | GET | List namespaces owned by (or participated in by) the logged-in user |
| `/api/namespaces` | POST | Create a new namespace; validates pattern, checks uniqueness, stores with `owner_id` |
| `/api/namespaces/[identifier]` | PATCH | Update `name` and/or `description` only (owner only; identifier field is ignored) |
| `/api/namespaces/check` | GET | Check if a given identifier is available; used for real-time form validation |

### Identifier Suggestion Algorithm

Runs **entirely in the browser** — no API call needed, zero latency for the user:

1. Strip spaces and special characters from the name
2. Extract the first letter plus significant consonants (skip vowels after position 1)
3. Uppercase everything, take the first 5 characters
4. If fewer than 5 characters remain, pad with digits (`1`, `2`, …)
5. If the suggested identifier turns out to be taken (after the availability check), append/increment the last digit automatically and try again

### Key Technical Decisions

| Decision | Reason |
|----------|--------|
| **Identifier suggestion is client-side** | No API call needed for the suggestion itself — instant feedback as the user types the name |
| **Availability check is a lightweight API call** | Debounced 300 ms after typing stops; queries the database; purely UX — does not replace the DB unique constraint |
| **Uniqueness enforced at DB level** | A unique constraint on `identifier` is the authoritative guard; the API check is best-effort UX only |
| **Identifier field excluded from PATCH** | The edit endpoint ignores any `identifier` in the request body, making immutability a server guarantee |
| **No membership table in PROJ-7** | Keeps schema lean; namespace access for non-owners is derived from conversations (PROJ-3 adds this) |
| **RLS Phase 1 (PROJ-7)** | Owner can SELECT and UPDATE their own namespaces; any authenticated user can INSERT |
| **RLS Phase 2 (PROJ-3)** | SELECT policy expanded: also grants access if the user is an attendee of any conversation in this namespace |

### shadcn/ui Components Used

- `Dialog` — create and edit modals
- `Card` — namespace display cards
- `Input` — name and identifier inputs
- `Textarea` — description input
- `Badge` — identifier pill display
- `Button` — all actions
- `Form` + `Label` — form structure and accessibility
- `Skeleton` — loading state for namespace list

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
