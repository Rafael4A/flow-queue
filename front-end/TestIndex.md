# Test Index: Flow-Queue — Front-End (F-Prefixed)

---

## F1. Front-End Tests (`front-end/src/`)

All front-end tests use `vitest` with `jsdom` environment. Tests live alongside source files as `*.test.tsx`

### F1.1. Totem Page (`pages/Totem.test.tsx`)

#### Test F1.1.1: Totem Renders Ticket Options

- **Setup**: Render `<Totem />` with mocked auth (TOTEM role) and queue context.
- **Assertion**: "Standard Ticket" text is visible.
- **Assertion**: "Priority Ticket" text is visible.
- **Assertion**: Both card components are rendered and clickable.

#### Test F1.1.2: Totem — Conventional Ticket Issue

- **Setup**: Render `<Totem />`, click "Standard Ticket" card.
- **Assertion**: `issueTicketRequest` is called with `{ ticketType: "CONVENTIONAL" }`.
- **Assertion**: Success snackbar alert is shown.

#### Test F1.1.3: Totem — Priority Ticket Issue

- **Setup**: Render `<Totem />`, click "Priority Ticket" card.
- **Assertion**: `issueTicketRequest` is called with `{ ticketType: "PRIORITY" }`.
- **Assertion**: Success snackbar alert is shown.

#### Test F1.1.4: Totem — Shows Waiting Counts

- **Setup**: Provide queue context with `waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 }`.
- **Assertion**: "5 people waiting" text is visible on Standard card.
- **Assertion**: "3 people waiting" text is visible on Priority card.

#### Test F1.1.5: Totem — Queue Summary Chips

- **Assertion**: Chip showing "Standard: 5" is rendered.
- **Assertion**: Chip showing "Priority: 3" is rendered.

#### Test F1.1.6: Totem — Card Disabled During Mutation

- **Setup**: Click "Standard Ticket" → mutation is pending.
- **Assertion**: Both cards have `opacity: 0.7` and `pointerEvents: "none"`.

#### Test F1.1.7: Totem — Loading State

- **Setup**: Provide queue context with `isLoading: true`.
- **Assertion**: "Loading..." text is rendered.
- **Assertion**: Ticket option cards are not rendered.

### F1.2. Desk Page (`pages/Desk.test.tsx`)

#### Test F1.2.1: Desk Renders with No Current Ticket

- **Setup**: Render `<Desk />` with mocked auth (DESK role), no current ticket.
- **Assertion**: "Staff Desk" heading is visible.
- **Assertion**: "No current ticket" text is visible.

#### Test F1.2.2: Desk — Call Next Button Disabled When Ticket Exists

- **Setup**: Provide queue context with a `CALLED` ticket.
- **Assertion**: "Call Next" button is disabled.

#### Test F1.2.3: Desk — Call Next Button Enabled When No Ticket

- **Setup**: No current ticket.
- **Assertion**: "Call Next" button is enabled.

#### Test F1.2.4: Desk — Repeat Call Enabled for CALLED Ticket with callCount < 3

- **Setup**: Provide ticket with `status: "CALLED"`, `callCount: 1`.
- **Assertion**: "Repeat Call" button is enabled.

#### Test F1.2.5: Desk — Repeat Call Disabled When callCount = 3

- **Setup**: Provide ticket with `status: "CALLED"`, `callCount: 3`.
- **Assertion**: "Repeat Call" button is disabled.

#### Test F1.2.6: Desk — Repeat Call Disabled When Not CALLED

- **Setup**: Provide ticket with `status: "IN_PROGRESS"`.
- **Assertion**: "Repeat Call" button is disabled.

#### Test F1.2.7: Desk — Mark Absent Enabled for CALLED Ticket

- **Setup**: Provide ticket with `status: "CALLED"`.
- **Assertion**: "Mark Absent" button is enabled.

#### Test F1.2.8: Desk — Mark Absent Disabled When Not CALLED

- **Setup**: Provide ticket with `status: "IN_PROGRESS"`.
- **Assertion**: "Mark Absent" button is disabled.

#### Test F1.2.9: Desk — Start Service Enabled for CALLED Ticket

- **Setup**: Provide ticket with `status: "CALLED"`.
- **Assertion**: "Start Service" button is enabled.

#### Test F1.2.10: Desk — Start Service Disabled When Not CALLED

- **Setup**: Provide ticket with `status: "IN_PROGRESS"`.
- **Assertion**: "Start Service" button is disabled.

#### Test F1.2.11: Desk — Complete Button Enabled for IN_PROGRESS Ticket

- **Setup**: Provide ticket with `status: "IN_PROGRESS"`.
- **Assertion**: "Complete" button is enabled.

#### Test F1.2.12: Desk — Complete Button Disabled When Not IN_PROGRESS

- **Setup**: Provide ticket with `status: "CALLED"`.
- **Assertion**: "Complete" button is disabled.

#### Test F1.2.13: Desk — Shows Current Ticket Info

- **Setup**: Provide ticket `{ id: "PRI-001", type: "PRIORITY", status: "CALLED", callCount: 1 }`.
- **Assertion**: "PRI-001" is displayed in large font.
- **Assertion**: "PRIORITY • Call #1" text is visible.
- **Assertion**: "Called" status text is shown.

#### Test F1.2.14: Desk — Call Next Button Calls Correct Mutation

- **Setup**: Render `<Desk />` with no current ticket.
- **Action**: Click "Call Next".
- **Assertion**: `callNextRequest` is called.

#### Test F1.2.15: Desk — Repeat Call Button Calls Correct Mutation

- **Setup**: Render `<Desk />` with a CALLED ticket.
- **Action**: Click "Repeat Call".
- **Assertion**: `repeatCallRequest` is called.

#### Test F1.2.16: Desk — Mark Absent Button Calls Correct Mutation

- **Setup**: Render `<Desk />` with a CALLED ticket.
- **Action**: Click "Mark Absent".
- **Assertion**: `markAbsentRequest` is called.

#### Test F1.2.17: Desk — Start Service Button Calls Correct Mutation

- **Setup**: Render `<Desk />` with a CALLED ticket.
- **Action**: Click "Start Service".
- **Assertion**: `startServiceRequest` is called.

#### Test F1.2.18: Desk — Complete Button Calls Correct Mutation

- **Setup**: Render `<Desk />` with an IN_PROGRESS ticket.
- **Action**: Click "Complete".
- **Assertion**: `completeRequest` is called.

#### Test F1.2.19: Desk — Requeue Input and Button

- **Setup**: Render `<Desk />`.
- **Action**: Type "PRI-001" into requeue input, click requeue button.
- **Assertion**: `requeueRequest` is called with `{ ticketId: "PRI-001" }`.
- **Assertion**: Input is cleared after success.
- **Assertion**: Success snackbar is shown.

#### Test F1.2.20: Desk — Requeue Button Disabled When Input Empty

- **Assertion**: Requeue icon button is disabled when text input is empty.

#### Test F1.2.21: Desk — Waiting Counts Displayed

- **Setup**: Provide queue context with `waitingTickets: { CONVENTIONAL: 4, PRIORITY: 2 }`.
- **Assertion**: Chip "Standard: 4" is rendered.
- **Assertion**: Chip "Priority: 2" is rendered.

### F1.3. Display Page (`pages/Display.test.tsx`)

#### Test F1.3.1: Display — No Current Ticket

- **Setup**: Render `<Display />` with `queue: { currentTicket: undefined, recentCalls: [], waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 } }`.
- **Assertion**: "—" is displayed as the current ticket number.
- **Assertion**: "Currently Serving" heading is visible.

#### Test F1.3.2: Display — Shows Current Ticket

- **Setup**: Provide `currentTicket: { id: "PRI-001", type: "PRIORITY", status: "CALLED", callCount: 1 }`.
- **Assertion**: "PRI-001" is displayed prominently.
- **Assertion**: "PRIORITY • Call #1" text is visible.

#### Test F1.3.3: Display — Shows "In Service" for IN_PROGRESS

- **Setup**: Provide ticket with `status: "IN_PROGRESS"`.
- **Assertion**: "In Service" text is displayed.

#### Test F1.3.4: Display — Shows "Absent" for ABSENT Ticket

- **Setup**: Provide ticket with `status: "ABSENT"`.
- **Assertion**: "Absent" text is displayed.

#### Test F1.3.5: Display — Waiting Counts

- **Setup**: Provide `waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 }`.
- **Assertion**: "5" is displayed under "Waiting - Standard".
- **Assertion**: "3" is displayed under "Waiting - Priority".

#### Test F1.3.6: Display — Recent Calls List

- **Setup**: Provide `recentCalls: [ticketA, ticketB, ticketC]`.
- **Assertion**: 3 rows are rendered in the recent calls list.
- **Assertion**: Each row shows ticket ID, type, and calledAt time.

#### Test F1.3.7: Display — "No Recent Calls" When Empty

- **Setup**: Provide `recentCalls: []`.
- **Assertion**: "No recent calls" text is displayed.

#### Test F1.3.8: Display — ABSENT Ticket Highlighted in Recent Calls

- **Setup**: Provide a recent call with `status: "ABSENT"`.
- **Assertion**: "Absent" chip is shown next to the ticket.
- **Assertion**: Row has error background color.

#### Test F1.3.9: Display — Loading State

- **Setup**: Provide `isLoading: true`.
- **Assertion**: "Loading..." text is displayed.

### F1.4. LogIn Page (`pages/LogIn.test.tsx`)

#### Test F1.4.1: Login Form Renders

- **Assertion**: "Sign In" heading is visible.
- **Assertion**: Username and password fields are rendered.
- **Assertion**: "Sign In" button is rendered.

#### Test F1.4.2: Login — Redirects to /desk for DESK Role

- **Setup**: Submit valid credentials that return role `DESK`.
- **Assertion**: User is redirected to `/desk`.

#### Test F1.4.3: Login — Redirects to /totem for TOTEM Role

- **Setup**: Submit valid credentials that return role `TOTEM`.
- **Assertion**: User is redirected to `/totem`.

#### Test F1.4.4: Login — Button Disabled When Fields Empty

- **Assertion**: Sign In button is disabled when username is empty.
- **Assertion**: Sign In button is disabled when password is empty.

#### Test F1.4.5: Login — Button Shows Loading State

- **Setup**: Submit credentials (mutation pending).
- **Assertion**: Button text is "Signing in...".
- **Assertion**: Both input fields are disabled.

### F1.5. Utility Functions (`utils/ticketStatusToText.test.ts`)

#### Test F1.5.1: All Status Mappings

- **Call**: `ticketStatusToText("ISSUED")` → expect `"Issued"`.
- **Call**: `ticketStatusToText("CALLED")` → expect `"Called"`.
- **Call**: `ticketStatusToText("IN_PROGRESS")` → expect `"In Progress"`.
- **Call**: `ticketStatusToText("COMPLETED")` → expect `"Completed"`.
- **Call**: `ticketStatusToText("ABSENT")` → expect `"Absent"`.

#### Test F1.5.2: Unknown Status Falls Through

- **Call**: `ticketStatusToText("UNKNOWN" as any)` → expect `"UNKNOWN"` (returns the input value).

### F1.6. API Client Functions (`api/*.test.ts`)

#### Test F1.6.1: issueTicketRequest — Success

- **MSW**: Return `{ id: "PRI-001", type: "PRIORITY", status: "ISSUED", callCount: 0, createdAt: "2024-01-01T00:00:00Z" }`.
- **Call**: `issueTicketRequest({ ticketType: "PRIORITY" })`.
- **Assertion**: Returns the ticket object with correct type.

#### Test F1.6.2: issueTicketRequest — 400 Error

- **MSW**: Return 400 with `{ message: "ticketType is missing or invalid" }`.
- **Call**: `issueTicketRequest({ ticketType: "INVALID" as any })`.
- **Assertion**: Throws `APIError` with `status === 400` and `message === "ticketType is missing or invalid"`.

#### Test F1.6.3: callNextRequest — Success

- **MSW**: Return ticket object.
- **Call**: `callNextRequest()`.
- **Assertion**: Returns ticket object.

#### Test F1.6.4: callNextRequest — No Tickets Waiting

- **MSW**: Return 200 with `{ message: "No tickets waiting" }`.
- **Call**: `callNextRequest()`.
- **Assertion**: Returns `{ message: "No tickets waiting" }` (no error thrown for 200).

#### Test F1.6.5: callNextRequest — 400 Error (Desk Has Ticket)

- **MSW**: Return 400 with `{ message: "Desk already has a ticket" }`.
- **Assertion**: Throws `APIError` with `status === 400`.

#### Test F1.6.6: getPublicQueueRequest — Success

- **MSW**: Return public queue view.
- **Assertion**: Returns the queue view object.

#### Test F1.6.7: getDeskTicketRequest — Success

- **MSW**: Return ticket object.
- **Assertion**: Returns the ticket.

#### Test F1.6.8: getDeskTicketRequest — No Ticket

- **MSW**: Return 200 with `null` or `{}`.
- **Assertion**: Returns `undefined` or `null`.

#### Test F1.6.9: repeatCallRequest — Success

- **MSW**: Return updated ticket.
- **Assertion**: Returns the ticket with incremented `callCount`.

#### Test F1.6.10: markAbsentRequest — Success

- **MSW**: Return ticket with `status: "ABSENT"`.
- **Assertion**: Returns the ticket.

#### Test F1.6.11: startServiceRequest — Success

- **MSW**: Return ticket with `status: "IN_PROGRESS"`.
- **Assertion**: Returns the ticket.

#### Test F1.6.12: completeServiceRequest — Success

- **MSW**: Return ticket with `status: "COMPLETED"`.
- **Assertion**: Returns the ticket.

#### Test F1.6.13: requeueRequest — Success

- **MSW**: Return ticket with `status: "ISSUED"`.
- **Assertion**: Returns the ticket.

#### Test F1.6.14: logInRequest — Success

- **MSW**: Return `{ sub: "desk-1", role: "DESK", deskId: "Desk 1" }`.
- **Assertion**: Returns the user payload.

#### Test F1.6.15: logInRequest — 401 Error

- **MSW**: Return 401 with `{ message: "Invalid username or password" }`.
- **Assertion**: Throws `APIError` with `status === 401`.

### F1.7. Context Tests

#### Test F1.7.1: AuthContext — Provides Auth from Cookie

- **Setup**: Set a JWT cookie in `document.cookie`, render `AuthProvider`.
- **Assertion**: `useAuthContext().auth` returns decoded payload.

#### Test F1.7.2: AuthContext — No Auth When No Cookie

- **Setup**: No cookie, render `AuthProvider`.
- **Assertion**: `useAuthContext().auth` is `undefined`.

#### Test F1.7.3: AuthContext — Throws Outside Provider

- **Assertion**: `useAuthContext()` throws `"useAuthContext must be used within a AuthProvider"`.

#### Test F1.7.4: QueueContext — Provides Queue Data

- **Setup**: Render `QueueProvider` with mocked fetch returning queue data.
- **Assertion**: `useQueueContext().queue` returns the queue data.
- **Assertion**: `useQueueContext().isLoading` transitions from `true` to `false`.

---

## Test Execution

### Run Tests

```bash
npm run front test
```

### Run Specific Test File

```bash
npm run front test -- src/pages/Desk.test.tsx
```
