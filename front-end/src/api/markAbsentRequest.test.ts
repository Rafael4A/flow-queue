import { describe, expect, it } from "vitest";
import { markAbsentRequest } from "./markAbsentRequest";

describe("markAbsentRequest", () => {
  it("4.7.10 - Success", async () => {
    const result = await markAbsentRequest({ ticketId: "PRI-001" });
    expect(result.status).toBe("ABSENT");
  });
});
