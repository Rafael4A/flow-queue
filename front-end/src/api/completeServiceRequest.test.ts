import { TICKET_STATUS } from "shared-code";
import { describe, expect, it } from "vitest";
import { completeServiceRequest } from "./completeServiceRequest";

describe("completeServiceRequest", () => {
  it("F1.6.12 - Success", async () => {
    const result = await completeServiceRequest({ ticketId: "PRI-001" });
    expect(result.status).toBe(TICKET_STATUS.COMPLETED);
  });
});
