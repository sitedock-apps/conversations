# PROJ-1: User Authentication

## Status: Deployed
**Created:** 2026-03-03
**Last Updated:** 2026-03-04

## Dependencies
- None

## User Stories
- As a new user, I want to enter my email address and receive a magic login link so that I can access the app without creating a password.
- As a returning user, I want to click a magic link in my email and be immediately logged in so that I can access my conversations quickly.
- As a user invited to a conversation, I want my magic link email to log me in and take me directly to that conversation so that I don't have to navigate manually.
- As a user, I want my session to persist across browser refreshes so that I don't have to log in repeatedly.
- As a user, I want to log out so that I can secure my session on shared devices.

## Acceptance Criteria
- [ ] A login page is shown to unauthenticated users with an email input field and a "Send magic link" button
- [ ] Submitting a valid email address sends a magic link email to that address within 30 seconds
- [ ] The magic link logs the user in when clicked and redirects them to the inbox (or the target conversation if one is specified)
- [ ] Clicking an expired or already-used magic link shows a clear error message and offers to resend
- [ ] A new user account is automatically created the first time a magic link is clicked for an unrecognized email
- [ ] The user's email address is displayed in the app header once logged in
- [ ] A "Log out" action ends the session and redirects to the login page
- [ ] Session persists across page refreshes without requiring re-authentication
- [ ] The login page is not accessible to already-authenticated users (redirect to inbox)

## Edge Cases
- What if the user enters an invalid email format? → Show inline validation error, prevent form submission
- What if the user requests multiple magic links in a row? → Each new request invalidates the previous link; most recent link works
- What if the magic link is clicked on a different device or browser than where it was requested? → Still works — link is not device-specific
- What if the user has no email client open? → Instructions shown after submit: "Check your email for your login link"
- What if the same email is used by multiple people (shared mailbox)? → Not supported in MVP; one email = one account

## Technical Requirements
- Security: Magic links must expire after 1 hour or first use (whichever comes first)
- Security: HTTPS required for all auth flows
- Performance: Login page loads in < 1 second
- Browser Support: Chrome, Firefox, Safari, Edge (latest 2 versions)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
App (Next.js)
│
├── /  (Login Page)
│   ├── LoginForm
│   │   ├── Email Input
│   │   ├── "Send magic link" Button
│   │   ├── Loading state (sending...)
│   │   └── Success state ("Check your email")
│   └── Error Banner (expired link, invalid email)
│
├── /auth/callback  (Magic Link Handler — invisible page)
│   └── Exchanges the magic link token for a session
│       then redirects to inbox (or target conversation)
│
└── App Shell (wraps all authenticated pages)
    ├── Header
    │   ├── App logo / name
    │   ├── Logged-in user's email
    │   └── "Log out" button
    └── [Protected page content]
```

### Data Model
Supabase Auth manages all user data automatically. No custom database table needed for this feature.

```
User (managed by Supabase Auth):
  - ID               Unique identifier (used to link to conversations)
  - Email address    The user's identity in the system
  - Created at       When the account was first created
  - Last sign-in     Most recent login timestamp

Session (stored in browser cookies):
  - Access token     Proves the user is logged in
  - Refresh token    Renews the session automatically
  - Expires at       1 hour; auto-refreshed while active
```

### Tech Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Auth provider | Supabase Auth | Built-in magic link support, handles token expiry, account creation, and session management out of the box |
| Session storage | Secure HTTP cookies (via @supabase/ssr) | More secure than localStorage for Next.js server-side rendering; tokens auto-refreshed |
| Route protection | Next.js Middleware | Runs on the server before any page loads — unauthenticated users never see protected pages, no flicker |
| Redirect after login | URL parameter (?next=/conversations/[id]) | Allows magic links from notification emails (PROJ-6) to drop users directly into the right conversation |

### Auth Flow (plain language)
1. User visits the app → server checks for a session → if none, login page is shown
2. User types their email and clicks "Send magic link"
3. Supabase sends an email with a secure one-time link (expires in 1 hour)
4. User sees a "Check your email" confirmation on screen
5. User clicks the link in their email → lands on /auth/callback
6. The callback page silently exchanges the token for a live session
7. User is redirected to the inbox — or to a specific conversation if the link came from a notification email

### URL Structure

| Route | Purpose |
|-------|---------|
| `/` | Login page (redirects to `/inbox` if already logged in) |
| `/auth/callback` | Handles magic link redirect from email |
| `/inbox` | First page after login (protected) |

### Dependencies

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Core Supabase client |
| `@supabase/ssr` | Server-side session handling for Next.js App Router |

## QA Test Results

**Tested:** 2026-03-04
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Method:** Code audit + static analysis (no running server available during test session)

### Acceptance Criteria Status

#### AC-1: Login page shown to unauthenticated users with email input and "Send magic link" button
- [x] Login page exists at `/` (src/app/page.tsx) and renders `LoginForm` component
- [x] Email input field present with `type="email"`, `id="email"`, placeholder "you@example.com"
- [x] "Send magic link" button present with Mail icon
- [x] Middleware redirects unauthenticated users to `/` for any protected route
- **PASS**

#### AC-2: Submitting a valid email sends a magic link email within 30 seconds
- [x] Form calls `supabase.auth.signInWithOtp({ email })` on submit
- [x] `emailRedirectTo` is set to `${window.location.origin}/auth/callback`
- [x] Loading state shown while sending ("Sending magic link..." with spinner)
- [ ] BUG: No server-side validation of the email -- relies solely on client-side regex and HTML5 `type="email"`. A crafted POST request could bypass client validation. (See BUG-3)
- **PASS (with caveat -- see BUG-3)**

#### AC-3: Magic link logs user in and redirects to inbox (or target conversation)
- [x] `/auth/callback/route.ts` exchanges the code for a session via `supabase.auth.exchangeCodeForSession(code)`
- [x] On success, redirects to the `next` query parameter, defaulting to `/inbox`
- [ ] BUG: The `next` parameter is not validated -- an attacker could craft an open redirect (See BUG-1)
- **PASS (with critical security issue -- see BUG-1)**

#### AC-4: Expired or already-used magic link shows clear error and offers to resend
- [x] Failed code exchange redirects to `/?error=auth_callback_error`
- [x] Login page parses `error` query param and shows: "Your magic link has expired or was already used. Please request a new one."
- [x] Error displayed in destructive Alert component with AlertCircle icon
- [ ] BUG: No explicit "Resend" button on the error state -- user must manually type email again and submit. The spec says "offers to resend." (See BUG-5)
- **PARTIAL PASS**

#### AC-5: New user account auto-created on first magic link click
- [x] Supabase Auth `signInWithOtp` automatically creates accounts for unrecognized emails -- this is handled by Supabase, not application code
- **PASS** (relies on Supabase default behavior)

#### AC-6: User's email displayed in app header once logged in
- [x] `AppHeader` component receives `userEmail` prop and renders it in a `<span>`
- [x] Protected layout (`src/app/(protected)/layout.tsx`) fetches user via `supabase.auth.getUser()` and passes `user.email` to `AppHeader`
- [x] Fallback to "Unknown" if email is null
- [ ] BUG: Email is hidden on mobile (`hidden sm:inline-block`) -- not visible on 375px screens (See BUG-6)
- **PARTIAL PASS**

#### AC-7: "Log out" action ends session and redirects to login page
- [x] `AppHeader` has a "Log out" button that calls `supabase.auth.signOut()`
- [x] After sign out, uses `window.location.href = "/"` for hard redirect (correct per frontend rules)
- [x] Loading state shown during logout (spinner replaces LogOut icon)
- [x] Button disabled during logout to prevent double-click
- [ ] BUG: If `signOut()` fails (network error), loading state resets but no error feedback is shown to the user (See BUG-7)
- **PASS (with minor UX issue)**

#### AC-8: Session persists across page refreshes
- [x] Middleware (`src/middleware.ts` + `src/lib/supabase/middleware.ts`) calls `supabase.auth.getUser()` on every request to refresh the session
- [x] Session stored in secure HTTP cookies via `@supabase/ssr`
- [x] Cookie values are properly synced between request and response in middleware
- **PASS**

#### AC-9: Login page not accessible to authenticated users (redirect to inbox)
- [x] Middleware checks `if (user && request.nextUrl.pathname === "/")` and redirects to `/inbox`
- **PASS**

### Edge Cases Status

#### EC-1: Invalid email format
- [x] Client-side regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- [x] HTML5 `type="email"` provides browser-native validation
- [x] `required` attribute prevents empty submission
- [x] Error message: "Please enter a valid email address."
- [x] Error clears when user starts typing again (`handleEmailChange` resets error state)
- **PASS**

#### EC-2: Multiple magic link requests in a row
- [x] Each call to `signInWithOtp` generates a new OTP -- Supabase invalidates previous tokens by default
- [x] No client-side rate limiting or debounce on the submit button
- [ ] BUG: No rate limiting on magic link requests -- a user (or attacker) can spam the endpoint repeatedly (See BUG-2)
- **PARTIAL PASS**

#### EC-3: Magic link clicked on different device/browser
- [x] The auth callback uses server-side code exchange (`exchangeCodeForSession`) which is not device-specific
- **PASS**

#### EC-4: User has no email client open
- [x] Success state shows: "Check your email" with the submitted email address displayed
- [x] Additional text: "Click the link in the email to sign in. The link expires in 1 hour."
- [x] "Use a different email" button provided to reset form
- **PASS**

#### EC-5: Same email used by multiple people (shared mailbox)
- [x] One email = one account, enforced by Supabase Auth by default
- **PASS** (as documented -- not supported in MVP)

### Additional Edge Cases Identified

#### EC-6: Empty email field submission
- [x] Button is disabled when `!email` (empty string is falsy)
- [x] `required` attribute on input provides browser-level blocking
- **PASS**

#### EC-7: No Supabase environment variables configured
- [ ] BUG: Non-null assertions (`!`) on `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` will cause a runtime crash with an unhelpful error if env vars are missing (See BUG-4)
- **FAIL**

#### EC-8: Auth callback with no code parameter
- [x] If `code` is falsy, redirects to `/?error=auth_callback_error`
- **PASS**

### Cross-Browser Testing (Code Audit)

Since no running server was available, this is based on code analysis:

- [x] No browser-specific APIs used (no `navigator.userAgent`, no `-webkit` prefixes in custom CSS)
- [x] Uses standard `<form>`, `<input type="email">`, `<button>` elements
- [x] Tailwind CSS handles cross-browser compatibility
- [x] `@supabase/ssr` uses standard cookie APIs
- **NOTE:** Manual cross-browser testing (Chrome, Firefox, Safari) should be performed when the server is running

### Responsive Testing (Code Audit)

- [x] Login card: `w-full max-w-sm` -- responsive, caps at small width
- [x] Main container: `flex min-h-screen items-center justify-center px-4` -- centers on all screens
- [ ] BUG: User email in header has `hidden sm:inline-block` -- invisible below 640px (See BUG-6)
- [x] Header uses `px-4 md:px-6` for responsive padding
- [x] "Log out" text has `hidden sm:inline-block` -- icon still visible on mobile (acceptable)
- **PARTIAL PASS** (email visibility issue on mobile)

### Security Audit Results

#### Authentication
- [x] Middleware protects all routes except `/` and `/auth/*` paths
- [x] Protected layout double-checks auth via `supabase.auth.getUser()` and redirects if no user
- [x] Session refresh handled in middleware on every request
- [x] Uses `supabase.auth.getUser()` (server-verified) not `getSession()` (JWT-only, can be spoofed)

#### Authorization
- [x] No user-to-user data access in this feature (auth only)
- [x] Supabase RLS is noted as a requirement in rules but no custom tables exist yet -- acceptable for this feature

#### Input Validation
- [ ] BUG: Email validation is client-side only (regex + HTML5). No Zod schema validation on the server side. The security rules mandate: "Validate ALL user input on the server side with Zod." However, since the only server action is Supabase's own `signInWithOtp`, Supabase handles its own email validation. Low practical risk but violates project conventions. (See BUG-3)

#### XSS / Injection
- [x] No `dangerouslySetInnerHTML`, `innerHTML`, `eval()`, or `document.write` found
- [x] React's JSX escapes rendered values by default
- [x] Email is rendered as text content, not as HTML

#### Open Redirect
- [ ] **CRITICAL: BUG-1** -- The `next` parameter in `/auth/callback` is not validated. An attacker can craft a URL like `/auth/callback?code=VALID_CODE&next=https://evil.com` and the server will redirect there after successful authentication. (See BUG-1)

#### Rate Limiting
- [ ] **HIGH: BUG-2** -- No rate limiting on the magic link OTP endpoint. An attacker can trigger unlimited email sends to any address, causing email spam and potential Supabase billing issues. The security rules explicitly require: "Implement rate limiting on authentication endpoints." (See BUG-2)

#### Secrets Management
- [x] Only `NEXT_PUBLIC_` prefixed env vars used in client code (Supabase URL and anon key -- safe to expose)
- [x] No secrets, private keys, or service role keys found in source code
- [x] `.env.local` is in `.gitignore`
- [x] `.env.local.example` contains only placeholder values

#### Security Headers
- [ ] BUG: No security headers configured in `next.config.ts`. The security rules require X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: origin-when-cross-origin, and Strict-Transport-Security. (See BUG-8)

#### HTTPS
- [x] No hardcoded HTTP URLs in code
- [x] `emailRedirectTo` uses `window.location.origin` which will be HTTPS in production
- **NOTE:** HTTPS enforcement depends on deployment configuration (Vercel handles this by default)

### Bugs Found

#### BUG-1: Open Redirect in Auth Callback
- **Severity:** Critical
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/src/app/auth/callback/route.ts`
- **Steps to Reproduce:**
  1. Attacker crafts a URL: `/auth/callback?code=VALID_CODE&next=https://evil-phishing-site.com`
  2. User clicks a legitimate-looking magic link that includes this crafted callback URL
  3. Expected: Redirect only to internal paths (e.g., `/inbox`, `/conversations/123`)
  4. Actual: Server performs `NextResponse.redirect(origin + next)` without validating that `next` is a relative path. If `next` starts with `//evil.com`, `https://evil.com`, or similar, the user is redirected to an external malicious site
- **Root Cause:** Line 7: `const next = searchParams.get("next") ?? "/inbox";` -- no validation that `next` is a safe internal path
- **Impact:** Phishing attacks, credential theft, session hijacking via redirect to attacker-controlled domain
- **Priority:** Fix before deployment

#### BUG-2: No Rate Limiting on Magic Link Endpoint
- **Severity:** High
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/src/components/auth/login-form.tsx`
- **Steps to Reproduce:**
  1. Open the login page
  2. Enter any email address
  3. Submit the form repeatedly (or script rapid API calls to Supabase signInWithOtp)
  4. Expected: Rate limiting prevents excessive requests (e.g., max 3 requests per minute)
  5. Actual: Unlimited magic link requests can be sent, triggering unlimited emails
- **Impact:** Email spam to arbitrary addresses, potential Supabase billing abuse, potential blocklisting of the app's email sending domain
- **Note:** Supabase has its own built-in rate limits (default ~30 requests/hour), but the application should implement its own as defense-in-depth per project security rules
- **Priority:** Fix before deployment

#### BUG-3: No Server-Side Email Validation (Zod)
- **Severity:** Low
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/src/components/auth/login-form.tsx`
- **Steps to Reproduce:**
  1. Bypass the client-side form by sending a direct API call to Supabase's signInWithOtp
  2. Expected: Server-side Zod validation rejects malformed input
  3. Actual: No server-side validation exists in the application code
- **Practical Impact:** Low -- Supabase itself validates the email server-side. However, this violates the project's security rules which mandate: "Validate ALL user input on the server side with Zod"
- **Priority:** Fix in next sprint

#### BUG-4: Missing Environment Variable Handling
- **Severity:** Medium
- **Files:**
  - `/Users/mwa/Development/sitedock-apps/conversations/src/lib/supabase/client.ts`
  - `/Users/mwa/Development/sitedock-apps/conversations/src/lib/supabase/server.ts`
  - `/Users/mwa/Development/sitedock-apps/conversations/src/lib/supabase/middleware.ts`
- **Steps to Reproduce:**
  1. Remove or leave unset `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`
  2. Start the development server
  3. Expected: A clear error message like "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
  4. Actual: Non-null assertion (`!`) causes `undefined` to be passed to `createBrowserClient`/`createServerClient`, leading to cryptic runtime errors
- **Priority:** Fix in next sprint

#### BUG-5: No Explicit "Resend" on Expired Link Error
- **Severity:** Medium
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/src/components/auth/login-form.tsx`
- **Steps to Reproduce:**
  1. Click an expired magic link
  2. Get redirected to `/?error=auth_callback_error`
  3. Expected: A "Resend magic link" button that pre-fills the email and triggers a new OTP
  4. Actual: Error message says "Please request a new one" but user must manually type their email again and click "Send magic link". The email from the expired token is not preserved.
- **Impact:** Poor UX for users with expired links -- they have to re-enter their email
- **Priority:** Fix in next sprint

#### BUG-6: User Email Not Visible on Mobile (375px)
- **Severity:** Medium
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/src/components/layout/app-header.tsx`
- **Steps to Reproduce:**
  1. Log in successfully
  2. View the app at 375px width (mobile viewport)
  3. Expected: User's email address is visible somewhere in the header (per AC-6: "email is displayed in the app header")
  4. Actual: The email `<span>` has class `hidden sm:inline-block`, making it invisible below 640px
- **Impact:** On mobile, users cannot see which account they are logged in as. The acceptance criterion says "displayed in the app header" without qualifying "only on desktop."
- **Priority:** Fix in next sprint

#### BUG-7: No Error Feedback on Logout Failure
- **Severity:** Low
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/src/components/layout/app-header.tsx`
- **Steps to Reproduce:**
  1. Disconnect from the network
  2. Click "Log out"
  3. Expected: An error toast or message telling the user the logout failed
  4. Actual: Loading spinner appears briefly, then reverts to normal state with no feedback
- **Root Cause:** The catch block in `handleLogout` only calls `setIsLoggingOut(false)` without displaying an error
- **Priority:** Nice to have

#### BUG-8: No Security Headers Configured
- **Severity:** High
- **File:** `/Users/mwa/Development/sitedock-apps/conversations/next.config.ts`
- **Steps to Reproduce:**
  1. Inspect HTTP response headers from the application
  2. Expected: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: origin-when-cross-origin, Strict-Transport-Security with includeSubDomains
  3. Actual: `next.config.ts` is empty -- no headers configured
- **Impact:** The app is vulnerable to clickjacking (no X-Frame-Options), MIME-type sniffing attacks, and lacks HSTS enforcement. These are required by the project's security rules.
- **Priority:** Fix before deployment

### Regression Testing

No features with status "Deployed" exist in `features/INDEX.md`, so there are no regression targets. All other features (PROJ-2 through PROJ-8) are in "Planned" status with no implementation.

### Summary
- **Acceptance Criteria:** 7/9 passed fully, 2 partial passes (AC-4 missing resend button, AC-6 email hidden on mobile)
- **Bugs Found:** 8 total (1 critical, 2 high, 3 medium, 2 low)
- **Security:** Issues found -- open redirect (critical), missing rate limiting (high), missing security headers (high)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-1 (open redirect), BUG-2 (rate limiting), and BUG-8 (security headers) before deployment. These are critical/high severity security issues that must not ship to production.

## Deployment
_To be added by /deploy_
