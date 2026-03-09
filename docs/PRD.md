# Product Requirements Document

## Vision
ConversationsFlow is a web-based alternative to email threads for multi-user communication. Users start focused conversations with a title, opening message, and file attachments; attendees receive email notifications with a magic login link to participate. All message content lives exclusively in the web app — emails are notification-only.

## Target Users
**Primary:** Small teams, agencies, and businesses that rely on email for group communication but find threads fragmented, hard to follow, and difficult to search.

**Pain points:**
- Email threads grow unwieldy with many participants and replies
- Attachments get buried in threads and are hard to find
- No clear ownership or structure to group discussions
- New participants added mid-thread miss earlier context

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | User Authentication (magic link) | Planned |
| P0 (MVP) | Conversation Inbox | Planned |
| P0 (MVP) | Create Conversation | Planned |
| P0 (MVP) | Conversation Feed & Messaging | Planned |
| P1 | Conversation Management (manager controls) | Planned |
| P1 | Email Notifications with Magic Links | Planned |
| P1 | Namespace Management | Planned |
| P1 | Namespace-scoped Inbox | Planned |

## Success Metrics
- Users can start and participate in a conversation in under 2 minutes
- Zero email threads needed to discuss a topic covered in ConversationsFlow
- Attendees successfully access the app via magic link without friction
- File attachments are accessible from the conversation at any time

## Constraints
- One-page web app (single URL, no complex routing needed for MVP)
- Magic-link authentication only — no passwords
- Email content must remain notification-only (no message content in emails)
- File attachments: any file type, ~10MB per file limit

## Non-Goals
- Mobile native app (web responsive only)
- Rich text / markdown formatting in messages (plain text for MVP)
- Threaded replies within a conversation (flat chronological feed only)
- Search across conversations (not in MVP)
- Read receipts or typing indicators (not in MVP)

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.
