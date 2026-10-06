import { describe, expect, it } from "vitest";
import { repeatCallRequest } from "./repeatCallRequest";

describe("repeatCallRequest", () => {
  it("4.7.9 - Success", async () => {
    const result = await repeatCallRequest({ ticketId: "PRI-001" });
    expect(result.callCount).toBe(2);
  });
});
