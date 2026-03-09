# PROJ-5: Conversation Management

## Status: Planned
**Created:** 2026-03-03
**Last Updated:** 2026-03-03

## Dependencies
- Requires: PROJ-1 (User Authentication) — only authenticated managers can perform these actions
- Requires: PROJ-4 (Conversation Feed) — management controls are accessed from within the conversation view
- Related to: PROJ-6 (Email Notifications) — adding new attendees triggers a notification email

## User Stories
- As a conversation manager, I want to add new attendees by email after the conversation has started so that I can include people who were missed initially.
- As a conversation manager, I want to remove an attendee from the conversation so that they no longer have access to the feed.
- As a conversation manager, I want to close a conversation so that it is marked as resolved and no further replies can be added.
- As a conversation manager, I want to re-open a closed conversation so that discussion can resume if needed.
- As an attendee (non-manager), I want to see who the conversation manager is so that I know who controls it.

## Acceptance Criteria
- [ ] Management controls are only visible to the conversation manager (not to other attendees)
- [ ] The manager can add one or more new attendees by entering their email addresses
- [ ] Adding a new attendee triggers a notification email with a magic link to the conversation (PROJ-6)
- [ ] Newly added attendees can see the full conversation history from the beginning
- [ ] The manager can remove any attendee (except themselves) from the conversation
- [ ] Removed attendees immediately lose access to the conversation feed and it disappears from their inbox
- [ ] The manager can close a conversation; closed conversations show a "Closed" status
- [ ] When a conversation is closed, the reply box is disabled for all attendees including the manager
- [ ] The manager can re-open a closed conversation, restoring the ability to reply
- [ ] The conversation manager is labeled/identified in the attendee list
- [ ] All management actions (add, remove, close, re-open) are shown as system messages in the feed (e.g., "Manager added user@email.com")

## Edge Cases
- What if the manager tries to remove themselves? → Not allowed; show error: "You cannot remove yourself as manager"
- What if the manager adds an email that is already an attendee? → Show error: "This person is already in this conversation"
- What if the manager adds their own email as a new attendee? → Show error: "You are already the manager of this conversation"
- What if the manager removes all attendees? → Allowed; conversation still exists with only the manager
- What if a removed attendee has the conversation URL bookmarked? → Server-side check denies access; they see "You no longer have access to this conversation"
- What if closing a conversation fails (network error)? → Show error; conversation remains open
- What if a non-manager attendee tries to access management endpoints directly? → Return 403; show access denied

## Technical Requirements
- Security: All management actions verified server-side — manager role checked on every request
- Audit trail: Management actions (add, remove, close, re-open) recorded as system messages in the feed
- Performance: Management actions complete in < 1 second
- Access revocation: Removed attendee access is revoked immediately (not on next request)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
