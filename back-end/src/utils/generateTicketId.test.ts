import { TICKET_TYPE } from "shared-code";
import { describe, expect, it } from "vitest";
import { generateTicketId } from "./generateTicketId";

describe("generateTicketId", () => {
  it("B1.5.1 - should generate priority ticket ID with correct format", () => {
    const result = generateTicketId(TICKET_TYPE.PRIORITY, 1);
    expect(result).toBe("PRI-001");
  });

  it("B1.5.2 - should generate conventional ticket ID with correct format", () => {
    const result = generateTicketId(TICKET_TYPE.CONVENTIONAL, 42);
    expect(result).toBe("CON-042");
  });

  it("B1.5.3 - should handle large sequence numbers without padding", () => {
    const result = generateTicketId(TICKET_TYPE.PRIORITY, 1000);
    expect(result).toBe("PRI-1000");
  });

  it("B1.5.4 - should handle zero sequence", () => {
    const result = generateTicketId(TICKET_TYPE.CONVENTIONAL, 0);
    expect(result).toBe("CON-000");
  });

  it("B1.5.5 - should throw error for invalid ticket type", () => {
    expect(() => generateTicketId("INVALID" as any, 1)).toThrow(
      "Invalid ticket type: INVALID",
    );
  });
});
