import { describe, expect, it, vi } from "vitest";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import type { APIError } from "../types";
import { issueTicketRequest } from "./issueTicketRequest";

describe("issueTicketRequest", () => {
  it("4.7.1 - Success", async () => {
    const mockTicket = {
      id: "PRI-001",
      type: "PRIORITY" as const,
      status: "ISSUED" as const,
      callCount: 0,
      createdAt: TEST_DEFAULT_DATE_STRING,
    };

    vi.spyOn(globalThis, "fetch");

    const result = await issueTicketRequest({ ticketType: "PRIORITY" });

    expect(result).toEqual(mockTicket);
    expect(fetch).toHaveBeenCalledWith("/api/totem/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketType: "PRIORITY" }),
      credentials: "include",
    });
  });

  it("4.7.2 - 400 Error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({ message: "ticketType is missing or invalid" }),
    });

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
