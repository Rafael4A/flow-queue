import { describe, expect, it, vi } from "vitest";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import { getDeskTicketRequest } from "./getDeskTicketRequest";

describe("getDeskTicketRequest", () => {
  it("4.7.7 - Success", async () => {
    const mockTicket = {
      id: "PRI-001",
      type: "PRIORITY",
      status: "CALLED",
      callCount: 1,
      createdAt: TEST_DEFAULT_DATE_STRING,
    };

    const result = await getDeskTicketRequest();
    expect(result).toEqual(mockTicket);
  });

  it("4.7.8 - No Ticket", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const result = await getDeskTicketRequest();
    expect(result).toBeNull();
  });
});
