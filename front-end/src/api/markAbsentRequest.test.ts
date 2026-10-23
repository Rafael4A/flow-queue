import { TICKET_STATUS } from "shared-code";
import { describe, expect, it } from "vitest";
import { markAbsentRequest } from "./markAbsentRequest";

describe("markAbsentRequest", () => {
  it("F1.6.10 - Success", async () => {
    const result = await markAbsentRequest({ ticketId: "PRI-001" });
    expect(result.status).toBe(TICKET_STATUS.ABSENT);
  });
});
