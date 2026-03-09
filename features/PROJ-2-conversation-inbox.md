# PROJ-2: Conversation Inbox

## Status: In Progress
**Created:** 2026-03-03
**Last Updated:** 2026-03-03

## Dependencies
- Requires: PROJ-1 (User Authentication) — inbox is only accessible to logged-in users

## User Stories
- As a logged-in user, I want to see all conversations I'm attending in one place so that I can easily find and continue them.
- As a user, I want conversations listed in reverse chronological order (most recent activity first) so that I can quickly see what's new.
- As a user, I want to click a conversation in the list to open it so that I can read or reply to it.
- As a user, I want to see a preview of each conversation (title, initiator, number of messages) so that I can quickly assess its content.
- As a user, I want to see a visual indicator on conversations with messages I haven't read so that I know where new activity is.
- As a user, I want to see conversations I manage (initiated) distinguished from ones I was invited to so that I can find my own conversations quickly.

## Acceptance Criteria
- [ ] The inbox is the first page shown after login
- [ ] All conversations the logged-in user is an attendee of are listed
- [ ] Conversations are sorted by most recent message activity (descending)
- [ ] Each conversation list item displays: full conversation identifier (e.g. `ANTPC-3`), title, initiating user's name/email, timestamp of last message, and message count
- [ ] The conversation identifier links directly to `/{namespace_id}/{conversation_number}` (e.g. `/ANTPC/3`)
- [ ] Archived/closed conversations are hidden from the default inbox view
- [ ] Clicking a conversation navigates to the conversation feed (PROJ-4)
- [ ] Unread conversations are visually distinguished (e.g., bold title or unread dot)
- [ ] An empty state is shown when the user has no conversations, with a prompt to start one
- [ ] A "New Conversation" button/action is accessible from the inbox

## Edge Cases
- What if the user has hundreds of conversations? → List should be paginated or virtually scrolled; load 20 at a time
- What if a conversation the user is attending has been archived by the manager? → Hidden from default inbox; optionally shown in a separate "Archived" section
- What if the user was removed from a conversation by the manager? → Conversation no longer appears in their inbox
- What if two conversations have the exact same timestamp? → Secondary sort by conversation creation time
- What if the user has no name set (new user, email only)? → Display their email address as the identifier

## Technical Requirements
- Performance: Inbox loads in < 500ms for up to 100 conversations
- Security: Only conversations the logged-in user is an attendee of are returned
- Responsive: Works on mobile (375px) and desktop (1440px)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
