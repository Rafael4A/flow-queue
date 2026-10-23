import { TICKET_STATUS, TICKET_TYPE, type Ticket } from "shared-code";
import { describe, expect, it } from "vitest";
import { timePropSort } from "./timePropSort";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "T1",
    type: TICKET_TYPE.PRIORITY,
    status: TICKET_STATUS.ISSUED,
    callCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("timePropSort", () => {
  it("B1.6.1 - should sort ascending by createdAt", () => {
    const D1 = new Date("2026-01-01");
    const D2 = new Date("2026-01-02");
    const D3 = new Date("2026-01-03");

    const tickets = [
      makeTicket({ id: "T3", createdAt: D3 }),
      makeTicket({ id: "T1", createdAt: D1 }),
      makeTicket({ id: "T2", createdAt: D2 }),
    ];

    tickets.sort(timePropSort("createdAt", true));

    expect(tickets[0]!.id).toBe("T1");
    expect(tickets[1]!.id).toBe("T2");
    expect(tickets[2]!.id).toBe("T3");
  });

  it("B1.6.2 - should sort descending by calledAt", () => {
    const D1 = new Date("2026-01-01");
    const D2 = new Date("2026-01-02");
    const D3 = new Date("2026-01-03");

    const tickets = [
      makeTicket({ id: "T1", calledAt: D1 }),
      makeTicket({ id: "T3", calledAt: D3 }),
      makeTicket({ id: "T2", calledAt: D2 }),
    ];

    tickets.sort(timePropSort("calledAt", false));

    expect(tickets[0]!.id).toBe("T3");
    expect(tickets[1]!.id).toBe("T2");
    expect(tickets[2]!.id).toBe("T1");
  });

  it("B1.6.3 - should sort tickets missing time property last for ascending", () => {
    const D1 = new Date("2026-01-01");

    const tickets = [
      makeTicket({ id: "B", createdAt: undefined as unknown as Date }),
      makeTicket({ id: "A", createdAt: D1 }),
    ];

    tickets.sort(timePropSort("createdAt", true));

    expect(tickets[0]!.id).toBe("A");
    expect(tickets[1]!.id).toBe("B");
  });

  it("B1.6.4 - should sort tickets missing time property first for descending", () => {
    const D1 = new Date("2026-01-01");

    const tickets = [
      makeTicket({ id: "A", calledAt: D1 }),
      makeTicket({ id: "B", calledAt: undefined as unknown as Date }),
    ];

    tickets.sort(timePropSort("calledAt", false));

    expect(tickets[0]!.id).toBe("B");
    expect(tickets[1]!.id).toBe("A");
  });

  it("B1.6.5 - should return 0 when both tickets missing time property", () => {
    const sortFn = timePropSort("createdAt", true);
    const a = makeTicket({ id: "A", createdAt: undefined as unknown as Date });
    const b = makeTicket({ id: "B", createdAt: undefined as unknown as Date });

    expect(sortFn(a, b)).toBe(0);
  });
});
