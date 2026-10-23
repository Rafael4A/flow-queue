import { TICKET_STATUS, TICKET_TYPE } from "shared-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import type { APIError } from "../types";
import { callNextRequest } from "./callNextRequest";

describe("callNextRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("F1.6.3 - Success", async () => {
    const mockTicket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: TEST_DEFAULT_DATE_STRING,
    };

    const result = await callNextRequest();
    expect(result).toEqual(mockTicket);
  });

  it("F1.6.4 - No Tickets Waiting", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: "No tickets waiting" }),
      }),
    );

    const result = await callNextRequest();
    expect(result).toEqual({ message: "No tickets waiting" });
  });

  it("F1.6.5 - 400 Error (Desk Has Ticket)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Desk already has a ticket" }),
      }),
    );

    const error = (await callNextRequest().catch((e) => e)) as APIError;
    expect(error.status).toBe(400);
  });
});
