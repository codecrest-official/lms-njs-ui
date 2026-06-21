# User Types: Post-Login Behavior

## Purpose
This document explains what happens after login for each user type in the current frontend implementation.

## Authentication Outcome Model
After successful login, the app stores an auth profile in session storage:

- `primaryRole`: user's default role from backend
- `allowedRoles`: roles this user is allowed to use
- `activeRole`: current working role (used by dashboard routing)

Then user is redirected to `/dashboard`.

---

## Post-Login Routing Rules
Dashboard behavior is decided by `activeRole`:

1. If `activeRole === "org_admin"` -> Org Admin Dashboard
2. Else if `activeRole !== "user"` -> Admin/Operator Workspace
3. Else -> End User Dashboard

If auth profile is missing/invalid, UI still hydrates but effectively falls back to user-like behavior because default role is treated as `"user"`.

---

## User Type Behaviors

## 1) user
### Landing
- Lands in the standard User Dashboard layout.
- Default tab is `Booth Access`.

### Available tabs and behavior
- **Booth Access**
  - Can open QR scanner.
  - Scanned booth QR is validated against known booth list.
  - If booth is online: access is granted and door unlock simulation is shown for 30 seconds.
  - If invalid/offline booth: access denied message is shown.

- **Books**
  - Shows allowed borrow limit, currently borrowed count, and available capacity.
  - Shows active borrowed books with due-date severity color coding.
  - Allows selecting reminder lead time (1/2/3/5/7 days).
  - Can toggle borrowing history table.
  - Can submit a specific book request via request panel (stored in component state).

- **Subscription**
  - Shows current subscription details.
  - Lists available plans from in-memory seed data.
  - "Subscribe" action is currently UI-only.

- **Profile**
  - Shows read-only profile fields (name, username, email, phone, org, member since).

- **Booth**
  - Search books across accessible booths (online only).
  - Detect nearest booth using browser geolocation.
  - Select booth and lock one book for 30 minutes (single active lock policy).

### Logout
- Clears `authProfile` from session storage.
- Redirects to `/login`.

---

## 2) operator
### Landing
- Lands in Admin/Operator Workspace, in operator mode.

### Available behavior
- **Booth login via QR/manual input**
  - Operator must scan or enter booth QR payload/id/name to activate a booth context.
- **Booth status management**
  - Can mark booth as `online`, `maintenance`, or `offline`.
- **Booth inventory management**
  - Can add book title/author/copies to selected booth.
  - Can remove books from selected booth.

### Notes
- Operator flow is booth-context driven; without booth login, management controls are limited.

### Logout
- Clears `authProfile` from session storage.
- Redirects to `/login`.

---

## 3) admin
### Landing
- Lands in Admin/Operator Workspace with `activeRole = "admin"` by default.

### Available behavior
- If admin has `allowedRoles` containing `operator`, role switcher appears.
- In `admin` view, currently shows a placeholder workspace card indicating to switch to operator workflow.
- On switching to `operator`, full operator booth workflow becomes available.

### Role switching
- Switch updates `activeRole` in state + session storage.
- No new login required.

### Logout
- Clears `authProfile` from session storage.
- Redirects to `/login`.

---

## 4) org_admin
### Landing
- Lands in Org Admin Dashboard.

### Available tabs and behavior
- **Overview**
  - KPI cards: users, loans, books, borrowing rate, booth count.
  - Trend chart with period switch (daily/weekly/monthly).
  - Booth status list.
  - Overdue user panel with "Send Notification" modal launch.

- **Books**
  - Table of currently borrowed records.
  - Book request panel for procurement-style requests.

- **Activity**
  - Timeline/list of borrowed/returned/overdue events.

- **Subscriptions**
  - Displays org subscription card(s) and limits.

- **Users**
  - User list with active/inactive toggles.
  - Enable all / Disable all actions.
  - Add user modal (email input).
  - Bulk upload modal (CSV upload flow UI).

### Modal behaviors
- **AddUserModal**: add/remove user UX is present; current logic is UI-state based.
- **NotificationModal**: message compose and send action are UI-state based.
- **BulkUploadModal**: file pick + process action are UI-state based.

### Logout
- Clears `authProfile` from session storage.
- Redirects to `/login`.

---

## Demo Credentials and Mapped Roles
Configured demo usernames map as follows:

- `rahul.verma` -> `user`
- `operator.kulkarni` -> `operator`
- `admin.sharma` -> `admin` with allowed roles `[admin, operator]`
- `org.admin` -> `org_admin`

---

## Important Data/Role Consistency Note
Current role sources are not fully aligned:

- Metadata CSV `UserTypes.csv` lists: `admin`, `operator`, `user`
- Frontend auth model and login demo data also use: `org_admin`

Recommendation: decide whether `org_admin` is a separate canonical user type in backend schema, or map it explicitly to an existing role with permission scopes.

---

## Current Implementation Scope (Post-Login)
Most post-login actions are currently frontend-state driven (mock behavior), including:

- Access grant simulation
- Book lock timers
- User status toggles
- Add/remove/bulk-upload user flows
- Notification send
- Subscription action button

To productionize, wire these actions to API endpoints and enforce role permissions server-side.