import { TICKET_STATUS, TICKET_TYPE } from "shared-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import { getDeskTicketRequest } from "./getDeskTicketRequest";

describe("getDeskTicketRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("F1.6.7 - Success", async () => {
    const mockTicket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: TEST_DEFAULT_DATE_STRING,
    };

    const result = await getDeskTicketRequest();
    expect(result).toEqual(mockTicket);
  });

  it("F1.6.8 - No Ticket", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      }),
    );

    const result = await getDeskTicketRequest();
    expect(result).toBeNull();
  });
});
