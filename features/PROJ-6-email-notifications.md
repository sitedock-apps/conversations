# PROJ-6: Email Notifications

## Status: Planned
**Created:** 2026-03-03
**Last Updated:** 2026-03-03

## Dependencies
- Requires: PROJ-1 (User Authentication) — magic links are tied to Supabase auth
- Requires: PROJ-3 (Create Conversation) — conversation creation triggers the first notification
- Requires: PROJ-4 (Conversation Feed) — new replies trigger notifications to all attendees
- Requires: PROJ-5 (Conversation Management) — adding a new attendee triggers a notification

## User Stories
- As a conversation attendee, I want to receive an email notification when a new message is posted so that I stay informed without having to check the app constantly.
- As a new attendee added to a conversation, I want to receive an email with a magic login link so that I can access the conversation without knowing my password.
- As an email recipient, I want to click the magic link and be taken directly to the conversation so that I can start reading and replying immediately.
- As a notification recipient, I want the email to tell me who posted and in which conversation, but not include the full message content so that I know to open the app.
- As a user, I want to not receive a notification for my own messages so that I'm not spammed with my own activity.

## Acceptance Criteria
- [ ] A notification email is sent to all attendees when: (a) a conversation is created, (b) a new message is posted, (c) a new attendee is added
- [ ] The sender of a message does NOT receive a notification for their own message
- [ ] Each notification email is personalized with a unique magic login link for that recipient
- [ ] The magic link redirects the user to the specific conversation after authentication
- [ ] The email body includes: conversation title, sender name/email, a note that the message is in the app, and the magic link button
- [ ] The email body does NOT include the message content or file attachment details
- [ ] The magic link in the email expires after 24 hours (longer window than manual login links)
- [ ] The email subject follows the format: `[ConversationsFlow] New message in "{Conversation Title}"`
- [ ] Emails are sent from a consistent "from" address (e.g., `noreply@conversationsflow.app`)
- [ ] If an email fails to send, the message is still saved and the failure is logged (no hard failure for the sender)
- [ ] When a new attendee is added, their welcome email has subject: `[ConversationsFlow] You've been added to "{Conversation Title}"`

## Edge Cases
- What if an attendee's email address is invalid or bounces? → Log the failure; don't retry; notify the manager in a system message
- What if multiple messages are posted in quick succession? → Each message triggers a separate email (no batching in MVP)
- What if the email service is down? → Message is saved successfully; email failure is logged; no error shown to sender
- What if a user is removed from a conversation and then receives a stale magic link? → Server-side access check denies entry; show "You no longer have access to this conversation"
- What if an attendee is added to a conversation with 50 prior messages? → Welcome email sent; they immediately see full history upon login
- What if the email notification is marked as spam by the recipient's provider? → Out of scope for MVP; recommend SPF/DKIM setup for the sending domain

## Technical Requirements
- Email provider: Transactional email service (e.g., Resend or SendGrid) — NOT Supabase default auth emails
- Magic links: Generated via Supabase Auth magic link API with a redirect URL to the conversation
- Delivery: Emails sent asynchronously (non-blocking to the sender's request)
- Logging: All email send attempts and failures logged for debugging
- Rate limiting: Maximum 1 email per attendee per message event (no duplicate sends)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
