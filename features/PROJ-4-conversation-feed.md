# PROJ-4: Conversation Feed

## Status: Planned
**Created:** 2026-03-03
**Last Updated:** 2026-03-03

## Dependencies
- Requires: PROJ-1 (User Authentication) — only attendees can view a conversation
- Requires: PROJ-3 (Create Conversation) — conversations must exist to be viewed
- Required by: PROJ-6 (Email Notifications) — new messages trigger attendee notifications

## User Stories
- As an attendee, I want to see all messages in a conversation in chronological order (oldest first) so that I can follow the discussion from start to finish.
- As an attendee, I want to scroll to the bottom automatically when I open a conversation so that I see the most recent messages first.
- As an attendee, I want to reply to a conversation by writing a message and optionally attaching files so that I can contribute to the discussion.
- As an attendee, I want to see who wrote each message and when so that I can understand the context of each contribution.
- As an attendee, I want to download or preview files attached to messages so that I can access shared documents.
- As a user arriving via magic link, I want to be taken directly to the conversation after login so that I don't have to navigate manually.
- As an attendee, I want to see the list of all conversation attendees so that I know who is participating.

## URL Pattern
Conversations are accessed at `/{namespace_id}/{conversation_number}` — e.g. `/ANTPC/3` for the third conversation in the ANTPC namespace. The full identifier `ANTPC-3` is displayed in the UI but the URL uses two separate path segments.

## Acceptance Criteria
- [ ] Conversations are accessible at `/{namespace_id}/{conversation_number}` (e.g. `/ANTPC/3`)
- [ ] The feed header displays the full conversation identifier (e.g. `ANTPC-3`) alongside the conversation title
- [ ] The feed header also displays the namespace name (e.g. "Anthropic") as context
- [ ] The conversation feed displays all messages in chronological order (oldest at top)
- [ ] Each message shows: sender name/email, timestamp, message body, and any file attachments
- [ ] The first message (opening message from the creator) is visually distinguished as the conversation starter
- [ ] New messages appear at the bottom; the view auto-scrolls to the newest message on open
- [ ] A reply compose area is fixed at the bottom of the feed
- [ ] The reply box accepts plain text (max 5000 characters) and up to 5 file attachments (max 10MB each)
- [ ] Sending a reply adds it to the feed immediately and triggers notification emails to all attendees (PROJ-6)
- [ ] File attachments in messages are displayed as clickable links with filename and file size
- [ ] Clicking a file attachment opens it in a new tab or triggers a download
- [ ] The list of conversation attendees is visible (e.g., in a sidebar or header section)
- [ ] A user arriving via magic link is redirected to the correct `/{namespace_id}/{conversation_number}` URL after authentication
- [ ] Non-attendees who try to access a conversation URL are shown an "Access denied" message
- [ ] Closed/archived conversations display a banner indicating they are closed; replies are disabled

## Edge Cases
- What if a conversation has hundreds of messages? → Load the most recent 50 messages; offer "Load earlier messages" button at the top
- What if a file attachment is no longer available (deleted from storage)? → Show "File no longer available" in place of the link
- What if the user submits an empty reply? → Prevent submission; show validation error
- What if the user's reply fails to send (network error)? → Show error message; preserve the draft in the compose area
- What if a new message arrives while the user is reading? → Show a "New message" indicator; auto-scroll if the user is already at the bottom
- What if the user is not an attendee of the conversation? → Return a 403-equivalent error; show "You don't have access to this conversation"
- What if the conversation is closed? → Show the full read-only feed with a "This conversation is closed" banner

## Technical Requirements
- Security: Enforce attendee-only access server-side (not just client-side)
- Performance: Feed loads in < 500ms for conversations with up to 100 messages
- File access: Attachment links must be signed/expiring URLs (not publicly accessible)
- Responsive: Usable on mobile (375px) and desktop (1440px)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
