import { TICKET_STATUS } from "shared-code";
import { describe, expect, it } from "vitest";
import { startServiceRequest } from "./startServiceRequest";

describe("startServiceRequest", () => {
  it("F1.6.11 - Success", async () => {
    const result = await startServiceRequest({ ticketId: "PRI-001" });
    expect(result.status).toBe(TICKET_STATUS.IN_PROGRESS);
  });
});
