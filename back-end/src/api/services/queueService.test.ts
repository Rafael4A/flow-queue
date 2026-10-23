import type { QueueState, Ticket } from "shared-code";
import { TICKET_STATUS, TICKET_TYPE } from "shared-code";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  callNext,
  completeService,
  getDeskTicket,
  getPublicState,
  issueTicket,
  markAbsent,
  repeatCall,
  requeueTicket,
  resetStateForTesting,
  startService,
} from "./queueService";

const storageMock = vi.hoisted(() => ({
  state: {
    priorityCounter: 0,
    sequences: { CONVENTIONAL: 0, PRIORITY: 0 },
    tickets: [] as Ticket[],
  } as QueueState,
  createInitialState() {
    return {
      priorityCounter: 0,
      sequences: { CONVENTIONAL: 0, PRIORITY: 0 },
      tickets: [] as Ticket[],
    };
  },
}));

vi.mock("../../storage/jsonStorage", () => ({
  loadState: vi.fn(() => storageMock.state),
  saveState: vi.fn((data) => (storageMock.state = data)),
}));

beforeEach(() => {
  storageMock.state = storageMock.createInitialState();
  resetStateForTesting();
});

describe("queueService - B1.1 Priority Scheduling", () => {
  it("B1.1.1 - Starvation-Free 2:1 Ratio - Basic Interleaving", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.CONVENTIONAL);
    issueTicket(TICKET_TYPE.CONVENTIONAL);

    const t1 = callNext("Desk 1");
    expect(t1!.id).toBe("PRI-001");
    expect(t1!.status).toBe(TICKET_STATUS.CALLED);
    expect(storageMock.state.priorityCounter).toBe(1);

    const t2 = callNext("Desk 2");
    expect(t2!.id).toBe("PRI-002");
    expect(t2!.status).toBe(TICKET_STATUS.CALLED);
    expect(storageMock.state.priorityCounter).toBe(2);

    const t3 = callNext("Desk 3");
    expect(t3!.id).toBe("CON-001");
    expect(t3!.status).toBe(TICKET_STATUS.CALLED);
    expect(storageMock.state.priorityCounter).toBe(0);

    const t4 = callNext("Desk 4");
    expect(t4!.id).toBe("PRI-003");
    expect(t4!.status).toBe(TICKET_STATUS.CALLED);
    expect(storageMock.state.priorityCounter).toBe(1);

    const t5 = callNext("Desk 5");
    expect(t5!.id).toBe("PRI-004");
    expect(t5!.status).toBe(TICKET_STATUS.CALLED);
    expect(storageMock.state.priorityCounter).toBe(2);

    const t6 = callNext("Desk 6");
    expect(t6!.id).toBe("CON-002");
    expect(t6!.status).toBe(TICKET_STATUS.CALLED);
    expect(storageMock.state.priorityCounter).toBe(0);
  });

  it("B1.1.2 - 2:1 Ratio with Mixed Arrival Order", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.CONVENTIONAL);
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.CONVENTIONAL);
    issueTicket(TICKET_TYPE.PRIORITY);

    const t1 = callNext("Desk 1");
    expect(t1!.id).toBe("PRI-001");
    expect(storageMock.state.priorityCounter).toBe(1);

    const t2 = callNext("Desk 2");
    expect(t2!.id).toBe("PRI-002");
    expect(storageMock.state.priorityCounter).toBe(2);

    const t3 = callNext("Desk 3");
    expect(t3!.id).toBe("CON-001");
    expect(storageMock.state.priorityCounter).toBe(0);

    const t4 = callNext("Desk 4");
    expect(t4!.id).toBe("PRI-003");
    expect(storageMock.state.priorityCounter).toBe(1);

    const t5 = callNext("Desk 5");
    expect(t5!.id).toBe("CON-002");
    expect(storageMock.state.priorityCounter).toBe(0);
  });

  it("B1.1.3 - Priority Queue Only (No Conventional Tickets)", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);

    const t1 = callNext("Desk 1");
    expect(t1!.id).toBe("PRI-001");
    expect(storageMock.state.priorityCounter).toBe(1);

    const t2 = callNext("Desk 2");
    expect(t2!.id).toBe("PRI-002");
    expect(storageMock.state.priorityCounter).toBe(2);

    const t3 = callNext("Desk 3");
    expect(t3!.id).toBe("PRI-003");
    expect(storageMock.state.priorityCounter).toBe(2);
  });

  it("B1.1.4 - Conventional Queue Only (No Priority Tickets)", () => {
    issueTicket(TICKET_TYPE.CONVENTIONAL);
    issueTicket(TICKET_TYPE.CONVENTIONAL);
    issueTicket(TICKET_TYPE.CONVENTIONAL);

    const t1 = callNext("Desk 1");
    expect(t1!.id).toBe("CON-001");

    const t2 = callNext("Desk 2");
    expect(t2!.id).toBe("CON-002");

    const t3 = callNext("Desk 3");
    expect(t3!.id).toBe("CON-003");
  });

  it("B1.1.5 - Empty Queue", () => {
    const result = callNext("Desk 1");
    expect(result).toBeUndefined();
  });

  it("B1.1.6 - Desk Already Has a Ticket", () => {
    issueTicket(TICKET_TYPE.PRIORITY);

    callNext("Desk 1");

    expect(() => callNext("Desk 1")).toThrow(/already has a ticket/);
  });

  it("B1.1.7 - Desk Calling for Different Desk (Cross-Desk Safety)", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.CONVENTIONAL);

    const t1 = callNext("Desk 1");
    expect(t1!.id).toBe("PRI-001");

    expect(() => callNext("Desk 1")).toThrow(/already has a ticket/);

    const t2 = callNext("Desk 2");
    expect(t2!.id).toBe("CON-001");
  });

  it("B1.1.8 - Priority Counter Persistence Across callNext Calls", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);

    const t1 = callNext("Desk 1");
    const t2 = callNext("Desk 2");

    expect(t1!.id).toBe("PRI-001");
    expect(t2!.id).toBe("PRI-002");
    expect(storageMock.state.priorityCounter).toBe(2);

    issueTicket(TICKET_TYPE.CONVENTIONAL);

    const t3 = callNext("Desk 3");
    expect(t3!.id).toBe("CON-001");
    expect(storageMock.state.priorityCounter).toBe(0);

    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);
    issueTicket(TICKET_TYPE.PRIORITY);

    const t4 = callNext("Desk 4");
    expect(t4!.id).toBe("PRI-003");
    expect(storageMock.state.priorityCounter).toBe(1);

    const t5 = callNext("Desk 5");
    expect(t5!.id).toBe("PRI-004");
    expect(storageMock.state.priorityCounter).toBe(2);

    const t6 = callNext("Desk 6");
    expect(t6!.id).toBe("PRI-005");
    expect(storageMock.state.priorityCounter).toBe(2);
  });

  it("B1.1.9 - Ticket Issuance Sequence Numbers", () => {
    const t1 = issueTicket(TICKET_TYPE.CONVENTIONAL);
    expect(t1.id).toBe("CON-001");

    const t2 = issueTicket(TICKET_TYPE.CONVENTIONAL);
    expect(t2.id).toBe("CON-002");

    const t3 = issueTicket(TICKET_TYPE.CONVENTIONAL);
    expect(t3.id).toBe("CON-003");

    const t4 = issueTicket(TICKET_TYPE.PRIORITY);
    expect(t4.id).toBe("PRI-001");

    const t5 = issueTicket(TICKET_TYPE.PRIORITY);
    expect(t5.id).toBe("PRI-002");

    const t6 = issueTicket(TICKET_TYPE.CONVENTIONAL);
    expect(t6.id).toBe("CON-004");
  });

  it("B1.1.10 - Ticket Issuance Creates Correct Ticket Object", () => {
    const pTicket = issueTicket(TICKET_TYPE.PRIORITY);

    expect(pTicket.id).toMatch(/^PRI-\d{3,}$/);
    expect(pTicket.type).toBe(TICKET_TYPE.PRIORITY);
    expect(pTicket.status).toBe(TICKET_STATUS.ISSUED);
    expect(pTicket.callCount).toBe(0);
    expect(pTicket.createdAt).toBeInstanceOf(Date);
    expect(pTicket.deskId).toBeUndefined();

    const cTicket = issueTicket(TICKET_TYPE.CONVENTIONAL);
    expect(cTicket.id).toMatch(/^CON-\d{3,}$/);
    expect(cTicket.type).toBe(TICKET_TYPE.CONVENTIONAL);
    expect(cTicket.status).toBe(TICKET_STATUS.ISSUED);
    expect(cTicket.callCount).toBe(0);
    expect(cTicket.createdAt).toBeInstanceOf(Date);
    expect(cTicket.deskId).toBeUndefined();
  });
});

describe("queueService - B1.2 Ticket Lifecycle", () => {
  it("B1.2.1 - Full Lifecycle ISSUED -> CALLED -> IN_PROGRESS -> COMPLETED", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);

    const called = callNext("Desk 1");
    expect(called!.status).toBe(TICKET_STATUS.CALLED);

    const started = startService(ticket.id, "Desk 1");
    expect(started.status).toBe(TICKET_STATUS.IN_PROGRESS);
    expect(started.startedAt).toBeInstanceOf(Date);

    const completed = completeService(ticket.id, "Desk 1");
    expect(completed.status).toBe(TICKET_STATUS.COMPLETED);
    expect(completed.completedAt).toBeInstanceOf(Date);
  });

  it("B1.2.2 - Invalid Transition COMPLETED Directly from ISSUED", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);

    expect(() => completeService(ticket.id, "Desk 1")).toThrow(
      /is not assigned to desk/,
    );
  });

  it("B1.2.3 - Invalid Transition START from ISSUED (bypass CALLED)", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);

    expect(() => startService(ticket.id, "Desk 1")).toThrow(
      /is not assigned to desk/,
    );
  });

  it("B1.2.4 - Invalid Transition COMPLETE from CALLED", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const ticket = getDeskTicket("Desk 1");
    expect(() => completeService(ticket!.id, "Desk 1")).toThrow(
      /is not in a progress state/,
    );
  });

  it("B1.2.5 - Invalid Transition START from IN_PROGRESS", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");
    startService(ticket.id, "Desk 1");

    expect(() => startService(ticket.id, "Desk 1")).toThrow(
      /is not in a called state/,
    );
  });

  it("B1.2.6 - Absent -> Requeue -> Back to ISSUED", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const absent = markAbsent(ticket.id, "Desk 1");
    expect(absent.status).toBe(TICKET_STATUS.ABSENT);

    const requeued = requeueTicket(ticket.id);
    expect(requeued.status).toBe(TICKET_STATUS.ISSUED);
    expect(requeued.deskId).toBeUndefined();
    expect(requeued.calledAt).toBeUndefined();
    expect(requeued.callCount).toBe(0);
    expect(requeued.createdAt).toBeInstanceOf(Date);

    const called = callNext("Desk 1");
    expect(called!.id).toBe(ticket.id);
  });

  it("B1.2.7 - Absent Ticket Cannot Be Started or Completed", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");
    markAbsent(ticket.id, "Desk 1");

    expect(() => startService(ticket.id, "Desk 1")).toThrow(
      /is not in a called state/,
    );

    expect(() => completeService(ticket.id, "Desk 1")).toThrow(
      /is not in a progress state/,
    );
  });

  it("B1.2.8 - Requeue from Wrong Status (not ABSENT)", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    expect(() => requeueTicket(ticket.id)).toThrow(/is not in an absent state/);
  });

  it("B1.2.9 - Ticket Not Found - All Functions", () => {
    issueTicket(TICKET_TYPE.PRIORITY);

    const nonExistentId = "nonexistent";
    expect(() => repeatCall(nonExistentId, "Desk 1")).toThrow(/not found/);
    expect(() => markAbsent(nonExistentId, "Desk 1")).toThrow(/not found/);
    expect(() => requeueTicket(nonExistentId)).toThrow(/not found/);
    expect(() => startService(nonExistentId, "Desk 1")).toThrow(/not found/);
    expect(() => completeService(nonExistentId, "Desk 1")).toThrow(/not found/);
  });

  it("B1.2.10 - Wrong Desk Assignment - repeatCall", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const ticket = getDeskTicket("Desk 1");
    expect(() => repeatCall(ticket!.id, "Desk 2")).toThrow(
      /is not assigned to desk Desk 2/,
    );
  });

  it("B1.2.11 - Wrong Desk Assignment - markAbsent", () => {
    issueTicket(TICKET_TYPE.CONVENTIONAL);
    callNext("Desk 1");

    const ticket = getDeskTicket("Desk 1");
    expect(() => markAbsent(ticket!.id, "Desk 2")).toThrow(
      /is not assigned to desk Desk 2/,
    );
  });

  it("B1.2.12 - Wrong Desk Assignment - startService", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const ticket = getDeskTicket("Desk 1");
    expect(() => startService(ticket!.id, "Desk 2")).toThrow(
      /is not assigned to desk Desk 2/,
    );
  });

  it("B1.2.13 - Wrong Desk Assignment - completeService", () => {
    const ticket = issueTicket(TICKET_TYPE.CONVENTIONAL);
    callNext("Desk 1");
    startService(ticket.id, "Desk 1");

    expect(() => completeService(ticket.id, "Desk 2")).toThrow(
      /is not assigned to desk Desk 2/,
    );
  });
});

describe("queueService - B1.3 Repeat Call", () => {
  it("B1.3.1 - Repeat Call Increments callCount", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const ticket = getDeskTicket("Desk 1");
    const t1 = repeatCall(ticket!.id, "Desk 1");
    expect(t1.callCount).toBe(2);
    expect(t1.calledAt).toBeInstanceOf(Date);
  });

  it("B1.3.2 - Repeat Call Reaches MAX_CALL_ATTEMPTS (3)", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const ticket = getDeskTicket("Desk 1");
    repeatCall(ticket!.id, "Desk 1");
    repeatCall(ticket!.id, "Desk 1");

    expect(() => repeatCall(ticket!.id, "Desk 1")).toThrow(
      /has reached the maximum number of call attempts/,
    );
  });

  it("B1.3.3 - Repeat Call on Non-CALLED Ticket", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    expect(() => repeatCall(ticket.id, "Desk 1")).toThrow(
      /is not assigned to desk/,
    );
  });

  it("B1.3.4 - Repeat Call on IN_PROGRESS Ticket", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");
    startService(ticket.id, "Desk 1");

    expect(() => repeatCall(ticket.id, "Desk 1")).toThrow(
      /is not in a called state/,
    );
  });
});

describe("queueService - B1.4 Public Queue View", () => {
  it("B1.4.1 - getPublicState - Empty Queue", () => {
    const state = getPublicState();
    expect(state.currentTicket).toBeUndefined();
    expect(state.recentCalls).toEqual([]);
    expect(state.waitingTickets?.CONVENTIONAL).toBe(0);
    expect(state.waitingTickets?.PRIORITY).toBe(0);
  });

  it("B1.4.2 - getPublicState - Current Ticket Displayed", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");

    const state = getPublicState();
    expect(state.currentTicket).toBeDefined();
    expect(state.currentTicket!.status).toBe(TICKET_STATUS.CALLED);
  });

  it("B1.4.3 - getPublicState - Recent Calls with Current Ticket (reaches max)", () => {
    for (let i = 0; i < 7; i++) {
      issueTicket(TICKET_TYPE.PRIORITY);
      callNext(`Desk ${i + 1}`);
    }

    const state = getPublicState();
    expect(state.recentCalls).toHaveLength(5);
  });

  it("B1.4.4 - getPublicState - Recent Calls without pending tickets", () => {
    for (let i = 0; i < 5; i++) {
      const ticket = issueTicket(TICKET_TYPE.PRIORITY);
      callNext("Desk 1");
      startService(ticket.id, "Desk 1");
      completeService(ticket.id, "Desk 1");
    }

    const state = getPublicState();
    expect(state.currentTicket).toBeUndefined();
    expect(state.recentCalls).toHaveLength(0);
  });

  it("B1.4.5 - getPublicState - Waiting Tickets Count", () => {
    for (let i = 0; i < 3; i++) {
      issueTicket(TICKET_TYPE.CONVENTIONAL);
    }
    for (let i = 0; i < 2; i++) {
      issueTicket(TICKET_TYPE.PRIORITY);
    }

    const state = getPublicState();
    expect(state.waitingTickets?.CONVENTIONAL).toBe(3);
    expect(state.waitingTickets?.PRIORITY).toBe(2);
  });

  it("B1.4.6 - getPublicState - ABSENT Ticket Not Shown as Current", () => {
    const ticket = issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 1");
    markAbsent(ticket.id, "Desk 1");

    const state = getPublicState();
    expect(state.currentTicket).toBeUndefined();
    expect(state.recentCalls?.some((t: Ticket) => t.id === ticket.id)).toBe(
      true,
    );
  });

  it("B1.4.7 - getPublicState - Recent Calls Sorted by calledAt Descending", () => {
    for (let i = 0; i < 3; i++) {
      issueTicket(TICKET_TYPE.PRIORITY);
      callNext(`Desk ${i + 1}`);
    }

    const state = getPublicState();

    const a = state.recentCalls?.[0]!;
    const b = state.recentCalls?.[1]!;

    expect(a.calledAt!.getTime()).toBeGreaterThanOrEqual(b.calledAt!.getTime());
  });

  it("B1.4.8 - getPublicState - Only CALLED and ABSENT in Recent Calls", () => {
    issueTicket(TICKET_TYPE.PRIORITY);
    const t1 = callNext("Desk 1");
    markAbsent(t1!.id, "Desk 1");

    issueTicket(TICKET_TYPE.CONVENTIONAL);
    callNext("Desk 1");

    const t3 = issueTicket(TICKET_TYPE.PRIORITY);
    callNext("Desk 2");
    startService(t3.id, "Desk 2");
    completeService(t3.id, "Desk 2");

    const state = getPublicState();

    for (const ticket of state.recentCalls!) {
      expect([TICKET_STATUS.CALLED, TICKET_STATUS.ABSENT]).toContain(
        ticket.status,
      );
      expect(ticket.calledAt).toBeDefined();
    }
  });
});
