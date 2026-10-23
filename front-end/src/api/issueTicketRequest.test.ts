import { TICKET_STATUS, TICKET_TYPE } from "shared-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import type { APIError } from "../types";
import { issueTicketRequest } from "./issueTicketRequest";

describe("issueTicketRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("F1.6.1 - Success", async () => {
    const mockTicket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.ISSUED,
      callCount: 0,
      createdAt: TEST_DEFAULT_DATE_STRING,
    };

    vi.spyOn(globalThis, "fetch");
    const result = await issueTicketRequest({
      ticketType: TICKET_TYPE.PRIORITY,
    });

    expect(result).toEqual(mockTicket);
    expect(fetch).toHaveBeenCalledWith("/api/totem/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketType: TICKET_TYPE.PRIORITY }),
      credentials: "include",
    });
  });

  it("F1.6.2 - 400 Error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({ message: "ticketType is missing or invalid" }),
      }),
    );

    await expect(
      issueTicketRequest({ ticketType: "INVALID" as any }),
    ).rejects.toThrow();

    const error = (await issueTicketRequest({
      ticketType: "INVALID" as any,
    }).catch((e) => e)) as APIError;
    expect(error.status).toBe(400);
    expect(error.message).toBe("ticketType is missing or invalid");
  });
});
