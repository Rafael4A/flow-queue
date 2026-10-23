import { TICKET_STATUS } from "shared-code";
import { describe, expect, it } from "vitest";
import { requeueRequest } from "./requeueRequest";

describe("requeueRequest", () => {
  it("F1.6.13 - Success", async () => {
    const result = await requeueRequest({ ticketId: "PRI-001" });
    expect(result.status).toBe(TICKET_STATUS.ISSUED);
  });
});
