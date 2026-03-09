# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Planned** - Requirements written, ready for development
- **In Progress** - Currently being built
- **In Review** - QA testing in progress
- **Deployed** - Live in production

## Features

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| PROJ-1 | User Authentication | Deployed | [PROJ-1-user-authentication.md](PROJ-1-user-authentication.md) | 2026-03-03 |
| PROJ-2 | Conversation Inbox | In Progress | [PROJ-2-conversation-inbox.md](PROJ-2-conversation-inbox.md) | 2026-03-03 |
| PROJ-3 | Create Conversation | Planned | [PROJ-3-create-conversation.md](PROJ-3-create-conversation.md) | 2026-03-03 |
| PROJ-4 | Conversation Feed | Planned | [PROJ-4-conversation-feed.md](PROJ-4-conversation-feed.md) | 2026-03-03 |
| PROJ-5 | Conversation Management | Planned | [PROJ-5-conversation-management.md](PROJ-5-conversation-management.md) | 2026-03-03 |
| PROJ-6 | Email Notifications | Planned | [PROJ-6-email-notifications.md](PROJ-6-email-notifications.md) | 2026-03-03 |
| PROJ-7 | Namespace Management | In Progress | [PROJ-7-namespace-management.md](PROJ-7-namespace-management.md) | 2026-03-03 |
| PROJ-8 | Namespace-scoped Inbox | Planned | [PROJ-8-namespace-scoped-inbox.md](PROJ-8-namespace-scoped-inbox.md) | 2026-03-03 |

<!-- Add features above this line -->

## Next Available ID: PROJ-9

## Build Order
1. **PROJ-1** — User Authentication (foundation for everything)
2. **PROJ-7** — Namespace Management (required before creating conversations)
3. **PROJ-2** — Conversation Inbox (first screen after login)
4. **PROJ-8** — Namespace-scoped Inbox (extends inbox with namespace filtering)
5. **PROJ-3** — Create Conversation (must include namespace selection)
6. **PROJ-4** — Conversation Feed (core viewing & messaging)
7. **PROJ-5** — Conversation Management (manager controls)
8. **PROJ-6** — Email Notifications (ties it all together)
