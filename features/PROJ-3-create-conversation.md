# PROJ-3: Create Conversation

## Status: Planned
**Created:** 2026-03-03
**Last Updated:** 2026-03-03

## Dependencies
- Requires: PROJ-1 (User Authentication) — only logged-in users can create conversations
- Required by: PROJ-6 (Email Notifications) — creating a conversation triggers attendee notifications

## User Stories
- As a logged-in user, I want to start a new conversation with a title and an opening message so that I can initiate a focused discussion.
- As a conversation creator, I want to add multiple attendees by typing their email addresses so that I can include everyone relevant from the start.
- As a creator, I want to attach files to my opening message so that I can share documents or images as part of the initial context.
- As a creator, I want a preview of the notification email that will be sent so that I understand what attendees will see.
- As a creator, I want to confirm before sending so that I don't accidentally start a conversation prematurely.

## Acceptance Criteria
- [ ] A "New Conversation" form is accessible from the inbox
- [ ] The form requires a title (non-empty, max 100 characters) and an opening message (non-empty, max 5000 characters)
- [ ] The user must select a namespace for the conversation; if they have no namespaces they are prompted to create one first
- [ ] Attendees are added by typing one or more email addresses; multiple emails can be added
- [ ] Each attendee email is validated for correct format before it can be added
- [ ] The creator is automatically set as the conversation manager and is not listed as a separate attendee
- [ ] At least one attendee must be added before the conversation can be submitted
- [ ] Up to 5 files can be attached to the opening message; each file max 10MB; any file type allowed
- [ ] Attached files are listed with their filename and size before submission
- [ ] Individual attached files can be removed before submission
- [ ] On creation, the conversation is assigned the next sequential number within its namespace (e.g. the 3rd conversation in `ANTPC` is assigned number `3`, giving it the full identifier `ANTPC-3`)
- [ ] The conversation number is assigned server-side atomically to prevent duplicate IDs under concurrent creation
- [ ] The full conversation identifier (e.g. `ANTPC-3`) is displayed in the conversation feed header (PROJ-4)
- [ ] After successful submission, the user is taken directly to the new conversation at `/{namespace_id}/{conversation_number}` (e.g. `/ANTPC/3`)
- [ ] Submitting the form triggers notification emails to all attendees (PROJ-6)
- [ ] If submission fails, an error message is shown and the form data is preserved

## Edge Cases
- What if an attendee email is the same as the creator's email? → Show an error: "You are already the manager of this conversation"
- What if the same email is added twice as an attendee? → Deduplicate silently; only one entry shown
- What if a file exceeds 10MB? → Show an inline error on that file; block submission until removed
- What if the total attachment size is very large? → Upload each file individually; show per-file progress
- What if the user navigates away mid-form? → Show a "You have unsaved changes" browser confirmation
- What if an attendee email belongs to an existing user? → Recognized silently; they get notified like any other attendee
- What if an attendee email belongs to a new user? → Account created when they click the magic link; no pre-registration needed

## Technical Requirements
- File uploads: Stored in Supabase Storage; accessible only to conversation attendees
- Performance: Form submission completes in < 3 seconds (excluding file upload time)
- Security: Authentication required; file types not executable on server-side
- Validation: All fields validated client-side and server-side

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
