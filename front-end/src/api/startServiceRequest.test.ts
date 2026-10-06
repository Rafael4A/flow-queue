import { describe, expect, it } from "vitest";
import { startServiceRequest } from "./startServiceRequest";

describe("startServiceRequest", () => {
  it("4.7.11 - Success", async () => {
    const result = await startServiceRequest({ ticketId: "PRI-001" });
    expect(result.status).toBe("IN_PROGRESS");
  });
});
