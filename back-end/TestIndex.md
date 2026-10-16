# Test Index: Flow-Queue — Back-End (B-Prefixed)

---

## B1. Back-End Unit Tests (`back-end/src/`)

All back-end tests use `vitest` with `node` environment. Tests live alongside source files as `*.test.ts`.

### B1.1. Queue Service — Priority Scheduling (`api/services/queueService.test.ts`)

#### Test B1.1.1: Starvation-Free 2:1 Ratio — Basic Interleaving

- **Setup**: Seed 4 priority tickets (`P1, P2, P3, P4`) and 2 conventional tickets (`C1, C2`) in the queue state.
- **Call 1**: `callNext("Desk 1")` → expect `P1` (priorityCounter = 1).
- **Call 2**: `callNext("Desk 1")` → expect `P2` (priorityCounter = 2).
- **Call 3**: `callNext("Desk 1")` → expect `C1` (conventional forced, priorityCounter resets to 0).
- **Call 4**: `callNext("Desk 1")` → expect `P3` (priorityCounter = 1).
- **Call 5**: `callNext("Desk 1")` → expect `P4` (priorityCounter = 2).
- **Call 6**: `callNext("Desk 1")` → expect `C2` (conventional forced).
- **Assertion**: Verify ticket order, priorityCounter value after each call, and ticket `status === "CALLED"`.

#### Test B1.1.2: 2:1 Ratio with Mixed Arrival Order

- **Setup**: Issue tickets in mixed order: `PRI-1, CON-1, PRI-2, CON-2, PRI-3`.
- **Call 1**: expect `PRI-1` (counter = 1).
- **Call 2**: expect `PRI-2` (counter = 2).
- **Call 3**: expect `CON-1` (reset counter).
- **Call 4**: expect `PRI-3` (counter = 1).
- **Call 5**: expect `CON-2` (reset counter).
- **Assertion**: Verify FIFO within each type and correct counter transitions.

#### Test B1.1.3: Priority Queue Only (No Conventional Tickets)

- **Setup**: Issue 3 priority tickets, 0 conventional.
- **Call 1**: expect priority ticket (counter = 1).
- **Call 2**: expect priority ticket (counter = 2).
- **Call 3**: expect priority ticket (fallback — no conventional available, counter exceeded).
- **Assertion**: Verify all 3 priority tickets are served without blocking, counter does not reset.

#### Test B1.1.4: Conventional Queue Only (No Priority Tickets)

- **Setup**: Issue 3 conventional tickets, 0 priority.
- **Call 1**: expect `CON-1`.
- **Call 2**: expect `CON-2`.
- **Call 3**: expect `CON-3`.
- **Assertion**: All conventional tickets served in order, no stuck behavior.

#### Test B1.1.5: Empty Queue

- **Setup**: No tickets in queue.
- **Call**: `callNext("Desk 1")` → expect `undefined`.
- **Assertion**: No error thrown, returns `undefined`.

#### Test B1.1.6: Desk Already Has a Ticket

- **Setup**: Issue a priority ticket and call it for "Desk 1" (desk now has a CALLED ticket).
- **Call**: `callNext("Desk 1")` → expect throws `Error` with message containing `"already has a ticket"`.
- **Assertion**: Desk cannot call next while holding a ticket.

#### Test B1.1.7: Desk Calling for Different Desk (Cross-Desk Safety)

- **Setup**: Issue a priority ticket.
- **Call**: `callNext("Desk 2")` → expect priority ticket assigned to "Desk 2".
- **Call**: `callNext("Desk 2")` → expect throws (Desk 2 already has ticket).
- **Call**: `callNext("Desk 1")` → expect next ticket assigned to "Desk 1".
- **Assertion**: Tickets are correctly scoped to desks; no cross-desk interference.

#### Test B1.1.8: Priority Counter Persistence Across callNext Calls

- **Setup**: Issue 2 priority tickets.
- **Call 1**: expect priority (counter = 1).
- **Call 2**: expect priority (counter = 2).
- **Issue 1 conventional ticket**.
- **Call 3**: expect conventional (counter resets to 0).
- **Issue 3 more priority tickets**.
- **Call 4**: expect priority (counter = 1).
- **Call 5**: expect priority (counter = 2).
- **Call 6**: expect priority (fallback, no conventional).
- **Assertion**: Counter correctly resets and accumulates across calls.

#### Test B1.1.9: Ticket Issuance Sequence Numbers

- **Setup**: Fresh state (sequences reset to 0).
- **Issue**: 3 conventional tickets → expect IDs `CON-001`, `CON-002`, `CON-003`.
- **Issue**: 2 priority tickets → expect IDs `PRI-001`, `PRI-002`.
- **Issue**: 1 conventional → expect `CON-004` (sequence continues).
- **Assertion**: Sequential numbering per type, no gaps, correct prefix.

#### Test B1.1.10: Ticket Issuance Creates Correct Ticket Object

- **Issue** a `PRIORITY` ticket.
- **Assertion**: Ticket has `id` matching `PRI-XXX` format, `type === "PRIORITY"`, `status === "ISSUED"`, `callCount === 0`, `createdAt` is a Date, `deskId` is `undefined`.

### B1.2. Queue Service — Ticket Lifecycle (`api/services/queueService.test.ts`)

#### Test B1.2.1: Full Lifecycle — ISSUED → CALLED → IN_PROGRESS → COMPLETED

- **Setup**: Issue a priority ticket, call it.
- **Step 1**: Ticket status is `CALLED`.
- **Step 2**: `startService(ticketId, deskId)` → status becomes `IN_PROGRESS`, `startedAt` is set.
- **Step 3**: `completeService(ticketId, deskId)` → status becomes `COMPLETED`, `completedAt` is set.
- **Assertion**: All timestamps are valid Dates, status transitions are correct.

#### Test B1.2.2: Invalid Transition — COMPLETED Directly from ISSUED

- **Setup**: Issue a ticket (status `ISSUED`).
- **Attempt**: `completeService(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in a progress state."`.

#### Test B1.2.3: Invalid Transition — START from ISSUED (bypass CALLED)

- **Setup**: Issue a ticket (status `ISSUED`).
- **Attempt**: `startService(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in a called state."`.

#### Test B1.2.4: Invalid Transition — COMPLETE from CALLED

- **Setup**: Issue and call a ticket (status `CALLED`).
- **Attempt**: `completeService(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in a progress state."`.

#### Test B1.2.5: Invalid Transition — START from IN_PROGRESS

- **Setup**: Issue, call, and start service on a ticket (status `IN_PROGRESS`).
- **Attempt**: `startService(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in a called state."`.

#### Test B1.2.6: Absent → Requeue → Back to ISSUED

- **Setup**: Issue a ticket, call it (status `CALLED`).
- **Step 1**: `markAbsent(ticketId, deskId)` → status becomes `ABSENT`.
- **Step 2**: `requeueTicket(ticketId)` → status becomes `ISSUED`, `deskId` is `undefined`, `calledAt` is `undefined`, `callCount` is `0`, `createdAt` is a new Date.
- **Step 3**: `callNext("Desk 1")` → requeued ticket can be called again.
- **Assertion**: Ticket re-enters queue at the end (FIFO position based on new `createdAt`).

#### Test B1.2.7: Absent Ticket Cannot Be Started or Completed

- **Setup**: Issue, call, mark absent a ticket.
- **Attempt**: `startService(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in a called state."`.
- **Attempt**: `completeService(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in a progress state."`.

#### Test B1.2.8: Requeue from Wrong Status (not ABSENT)

- **Setup**: Issue a ticket (status `ISSUED`).
- **Attempt**: `requeueTicket(ticketId)`.
- **Assertion**: Throws `Error` with message `"Ticket ... is not in an absent state."`.

#### Test B1.2.9: Ticket Not Found — All Functions

- **For each function**: `repeatCall`, `markAbsent`, `requeueTicket`, `startService`, `completeService`.
- **Pass** a non-existent ticket ID.
- **Assertion**: Each throws `Error` with message containing `"not found"`.

#### Test B1.2.10: Wrong Desk Assignment — repeatCall

- **Setup**: Issue a ticket, call it for "Desk 1".
- **Attempt**: `repeatCall(ticketId, "Desk 2")`.
- **Assertion**: Throws `Error` with message `"is not assigned to desk Desk 2"`.

#### Test B1.2.11: Wrong Desk Assignment — markAbsent

- **Setup**: Issue a ticket, call it for "Desk 1".
- **Attempt**: `markAbsent(ticketId, "Desk 2")`.
- **Assertion**: Throws `Error` with message `"is not assigned to desk Desk 2"`.

#### Test B1.2.12: Wrong Desk Assignment — startService

- **Setup**: Issue a ticket, call it for "Desk 1".
- **Attempt**: `startService(ticketId, "Desk 2")`.
- **Assertion**: Throws `Error` with message `"is not assigned to desk Desk 2"`.

#### Test B1.2.13: Wrong Desk Assignment — completeService

- **Setup**: Issue, call, start service on a ticket for "Desk 1".
- **Attempt**: `completeService(ticketId, "Desk 2")`.
- **Assertion**: Throws `Error` with message `"is not assigned to desk Desk 2"`.

### B1.3. Queue Service — Repeat Call (`api/services/queueService.test.ts`)

#### Test B1.3.1: Repeat Call Increments callCount

- **Setup**: Issue and call a ticket (callCount = 1).
- **Call**: `repeatCall(ticketId, deskId)`.
- **Assertion**: callCount becomes 2, `calledAt` is updated to a new Date.

#### Test B1.3.2: Repeat Call Reaches MAX_CALL_ATTEMPTS (3)

- **Setup**: Issue and call a ticket.
- **Repeat 1**: callCount → 2.
- **Repeat 2**: callCount → 3.
- **Repeat 3**: `repeatCall(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"has reached the maximum number of call attempts"`.

#### Test B1.3.3: Repeat Call on Non-CALLED Ticket

- **Setup**: Issue a ticket (status `ISSUED`).
- **Attempt**: `repeatCall(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"is not in a called state."`.

#### Test B1.3.4: Repeat Call on IN_PROGRESS Ticket

- **Setup**: Issue, call, start service on a ticket (status `IN_PROGRESS`).
- **Attempt**: `repeatCall(ticketId, deskId)`.
- **Assertion**: Throws `Error` with message `"is not in a called state."`.

### B1.4. Public Queue View (`api/services/queueService.test.ts`)

#### Test B1.4.1: getPublicState — Empty Queue

- **Setup**: No tickets.
- **Call**: `getPublicState()`.
- **Assertion**: `currentTicket` is `undefined`, `recentCalls` is `[]`, `waitingTickets` is `{ CONVENTIONAL: 0, PRIORITY: 0 }`.

#### Test B1.4.2: getPublicState — Current Ticket Displayed

- **Setup**: Issue and call a priority ticket.
- **Call**: `getPublicState()`.
- **Assertion**: `currentTicket` is the called ticket, `currentTicket.status === "CALLED"`.

#### Test B1.4.3: getPublicState — Recent Calls with Current Ticket

- **Setup**: Issue and call 7 tickets sequentially (filling recent calls).
- **Call**: `getPublicState()`.
- **Assertion**: `recentCalls` has 6 entries (current ticket excluded from recentCalls when currentTicket exists).

#### Test B1.4.4: getPublicState — Recent Calls without Current Ticket

- **Setup**: Issue, call, and complete 5 tickets. No current ticket (all completed).
- **Call**: `getPublicState()`.
- **Assertion**: `currentTicket` is `undefined`, `recentCalls` has 5 entries (all shown when no current ticket).

#### Test B1.4.5: getPublicState — Waiting Tickets Count

- **Setup**: Issue 3 conventional and 2 priority tickets (none called).
- **Call**: `getPublicState()`.
- **Assertion**: `waitingTickets.CONVENTIONAL === 3`, `waitingTickets.PRIORITY === 2`.

#### Test B1.4.6: getPublicState — ABSENT Ticket Not Shown as Current

- **Setup**: Issue and call a ticket, then mark it absent.
- **Call**: `getPublicState()`.
- **Assertion**: `currentTicket` is `undefined` (ABSENT tickets are filtered out from currentTicket).
- **Assertion**: ABSENT ticket appears in `recentCalls` with status `ABSENT`.

#### Test B1.4.7: getPublicState — Recent Calls Sorted by calledAt Descending

- **Setup**: Issue and call tickets A, B, C with small time delays between each.
- **Call**: `getPublicState()`.
- **Assertion**: `recentCalls[0]` is the most recently called (C), order is descending by `calledAt`.

#### Test B1.4.8: getPublicState — Only CALLED and ABSENT in Recent Calls

- **Setup**: Issue tickets, call some, complete some, mark some absent.
- **Call**: `getPublicState()`.
- **Assertion**: `recentCalls` contains only tickets with status `CALLED` or `ABSENT` that have a `calledAt`.

### B1.5. Ticket ID Generation (`utils/generateTicketId.test.ts`)

#### Test B1.5.1: Priority Ticket ID Format

- **Call**: `generateTicketId("PRIORITY", 1)`.
- **Assertion**: Returns `"PRI-001"`.

#### Test B1.5.2: Conventional Ticket ID Format

- **Call**: `generateTicketId("CONVENTIONAL", 42)`.
- **Assertion**: Returns `"CON-042"`.

#### Test B1.5.3: Large Sequence Numbers

- **Call**: `generateTicketId("PRIORITY", 1000)`.
- **Assertion**: Returns `"PRI-1000"` (no padding needed beyond 3 digits).

#### Test B1.5.4: Zero Sequence

- **Call**: `generateTicketId("CONVENTIONAL", 0)`.
- **Assertion**: Returns `"CON-000"`.

#### Test B1.5.5: Invalid Ticket Type

- **Call**: `generateTicketId("INVALID" as any, 1)`.
- **Assertion**: Throws `Error` with message `"Invalid ticket type"`.

### B1.6. Time Property Sort (`utils/timePropSort.test.ts`)

#### Test B1.6.1: Ascending Sort by createdAt

- **Setup**: 3 tickets with `createdAt` dates D1 < D2 < D3.
- **Call**: `timePropSort("createdAt", true)`.
- **Assertion**: Sort order is D1, D2, D3.

#### Test B1.6.2: Descending Sort by calledAt

- **Setup**: 3 tickets with `calledAt` dates D3 > D2 > D1.
- **Call**: `timePropSort("calledAt", false)`.
- **Assertion**: Sort order is D3, D2, D1.

#### Test B1.6.3: Tickets Missing Time Property — Ascending

- **Setup**: Ticket A has `createdAt`, Ticket B does not.
- **Call**: `timePropSort("createdAt", true)`.
- **Assertion**: Ticket B (missing) sorts after A → order is [A, B].

#### Test B1.6.4: Tickets Missing Time Property — Descending

- **Setup**: Ticket A has `calledAt`, Ticket B does not.
- **Call**: `timePropSort("calledAt", false)`.
- **Assertion**: Ticket B (missing) sorts before A → order is [B, A].

#### Test B1.6.5: Both Tickets Missing Time Property

- **Assertion**: Returns 0 (stable sort, no reordering).

### B1.7. JSON Storage (`storage/jsonStorage.test.ts`)

#### Test B1.7.1: saveState and loadState — Round Trip

- **Setup**: Create a `QueueState` with 3 tickets (including Date fields).
- **Call**: `saveState(state)`, then `loadState()`.
- **Assertion**: Loaded state has identical `tickets`, `priorityCounter`, and `sequences`.
- **Assertion**: All Date fields are restored as `Date` objects (not strings).

#### Test B1.7.2: loadState — Missing File Returns Default

- **Setup**: Ensure `state.json` does not exist (or use a temp directory).
- **Call**: `loadState()`.
- **Assertion**: Returns `{ priorityCounter: 0, sequences: { CONVENTIONAL: 0, PRIORITY: 0 }, tickets: [] }`.

#### Test B1.7.3: Atomic Write — Temp File Renamed to state.json

- **Setup**: Save state, verify `state.temp.json` no longer exists (renamed).
- **Assertion**: `state.json` exists and contains valid JSON.

#### Test B1.7.4: ISO Date Parsing — Various Formats

- **Setup**: Write JSON with Date strings in different ISO formats (with/without milliseconds, with/without Z).
- **Call**: `loadState()`.
- **Assertion**: All date strings are correctly parsed to `Date` objects.

---

## B2. Back-End Auth Tests (`back-end/src/api/`)

### B2.1. Auth Service (`api/services/authService.test.ts`)

#### Test B2.1.1: Valid Login — TOTEM Role

- **Setup**: Mock `accounts.json` with test accounts. Set `JWT_SECRET = "test-secret"`.
- **Call**: `authenticateUser("totem-main", "pwd")`.
- **Assertion**: Returns `{ token: string, user: { sub: "totem-main", role: "TOTEM" } }`.
- **Assertion**: Token is a valid JWT that can be decoded.

#### Test B2.1.2: Valid Login — DESK Role with deskId

- **Call**: `authenticateUser("desk-1", "pwd")`.
- **Assertion**: Returns `{ user: { sub: "desk-1", role: "DESK", deskId: "Desk 1" } }`.

#### Test B2.1.3: Invalid Username

- **Call**: `authenticateUser("nonexistent", "pwd")`.
- **Assertion**: Throws `Error` with message `"Invalid username or password"`.

#### Test B2.1.4: Invalid Password

- **Call**: `authenticateUser("desk-1", "wrong-password")`.
- **Assertion**: Throws `Error` with message `"Invalid username or password"`.

#### Test B2.1.5: JWT Token Expiration

- **Call**: `authenticateUser("desk-1", "pwd")`.
- **Assertion**: Token has `exp` claim set to ~1 hour from now.

### B2.2. Auth Middleware (`api/middlewares/authMiddleware.test.ts`)

#### Test B2.2.1: verifyJwt — No Token

- **Setup**: Request with no cookie.
- **Assertion**: Returns 401 with `{ message: "Authentication required: No token provided" }`.

#### Test B2.2.2: verifyJwt — Invalid Token

- **Setup**: Request with `token: "invalid-token"` cookie.
- **Assertion**: Returns 403 with `{ message: "Invalid or expired token" }`.

#### Test B2.2.3: verifyJwt — Valid Token Attaches User

- **Setup**: Create a valid JWT, set as cookie.
- **Assertion**: `req.user` is populated with decoded payload.
- **Assertion**: `next()` is called (no error response).

#### Test B2.2.4: requireRole — Allowed Role

- **Setup**: User with role `DESK`, middleware `requireRole(["DESK"])`.
- **Assertion**: `next()` is called.

#### Test B2.2.5: requireRole — Forbidden Role

- **Setup**: User with role `TOTEM`, middleware `requireRole(["DESK"])`.
- **Assertion**: Returns 403 with `{ message: "Forbidden" }`.

#### Test B2.2.6: requireRole — No User Attached

- **Setup**: No `req.user` (verifyJwt not called).
- **Assertion**: Returns 401 with `{ message: "Unauthorized" }`.

---

## Test Execution

### Run Tests

```bash
npm run back test
```

### Run Specific Test File

```bash
npm run back test -- src/api/services/queueService.test.ts
```
