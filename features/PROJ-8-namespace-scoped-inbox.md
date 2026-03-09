# PROJ-8: Namespace-scoped Inbox

## Status: Planned
**Created:** 2026-03-03
**Last Updated:** 2026-03-03

## Dependencies
- Requires: PROJ-1 (User Authentication) — inbox is only accessible to logged-in users
- Requires: PROJ-2 (Conversation Inbox) — extends the existing inbox with namespace filtering
- Requires: PROJ-7 (Namespace Management) — namespaces must exist to filter by

## User Stories
- As a user with conversations across multiple namespaces, I want to filter my inbox by a specific namespace so that I can focus on one context at a time.
- As a user, I want to see which namespace each conversation belongs to in my inbox so that I can tell them apart at a glance.
- As a user, I want a combined "All conversations" view that shows conversations from all my namespaces so that I can see everything at once.
- As a user switching between namespaces, I want the selected namespace to persist across sessions so that I return to the same context when I come back.
- As a user, I want the number of unread conversations per namespace shown in the namespace list so that I can prioritize which namespace to check first.

## Acceptance Criteria
- [ ] The inbox includes a namespace switcher (e.g., sidebar or top-level tabs) listing all namespaces the user participates in
- [ ] Selecting a namespace filters the conversation list to show only conversations in that namespace
- [ ] An "All" option shows conversations from all namespaces in one combined chronological list
- [ ] Each conversation row in the inbox displays the namespace identifier (e.g. `ANTPC`) as a badge or label
- [ ] The "All" view is the default when the user has not previously selected a namespace
- [ ] The last selected namespace is remembered and restored on next login
- [ ] Each namespace entry in the switcher shows the count of unread conversations in that namespace
- [ ] When a user's last conversation in a namespace is removed (they are removed as attendee), that namespace disappears from their switcher
- [ ] The namespace switcher is responsive and usable on mobile (375px) and desktop (1440px)
- [ ] If the user has only one namespace, the switcher is still shown (to support future growth)

## Edge Cases
- What if a user has many namespaces (e.g., 20+)? → Namespace list is scrollable; no hard limit in MVP
- What if a selected namespace becomes empty (all conversations removed/archived)? → Show an empty state: "No conversations in this namespace" with a prompt to start one
- What if the user is added to a new namespace (joins a new conversation in a new namespace) while the app is open? → Namespace appears in the switcher on next page load or refresh; no real-time update required in MVP
- What if the "All" view has hundreds of conversations? → Same pagination rules as PROJ-2 (20 at a time)
- What if the URL contains a namespace identifier (e.g. `/ANTPC`) and the user doesn't have access to it? → Show "Namespace not found or you don't have access"

## Technical Requirements
- Performance: Namespace switcher and filtered inbox load in < 300ms
- Security: Namespace filtering enforced server-side — users only see namespaces derived from their conversations
- Persistence: Last selected namespace stored in user preferences (database, not just localStorage)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
