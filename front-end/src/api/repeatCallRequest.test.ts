import { describe, expect, it } from "vitest";
import { repeatCallRequest } from "./repeatCallRequest";

describe("repeatCallRequest", () => {
  it("F1.6.9 - Success", async () => {
    const result = await repeatCallRequest({ ticketId: "PRI-001" });
    expect(result.callCount).toBe(2);
  });
});
