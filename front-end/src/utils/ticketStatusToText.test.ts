import { describe, expect, it } from "vitest";
import { ticketStatusToText } from "./ticketStatusToText";
import { TICKET_STATUS } from "shared-code";

describe("ticketStatusToText", () => {
  it("F1.5.1 - All Status Mappings", () => {
    expect(ticketStatusToText(TICKET_STATUS.ISSUED)).toBe("Issued");
    expect(ticketStatusToText(TICKET_STATUS.CALLED)).toBe("Called");
    expect(ticketStatusToText(TICKET_STATUS.IN_PROGRESS)).toBe("In Progress");
    expect(ticketStatusToText(TICKET_STATUS.COMPLETED)).toBe("Completed");
    expect(ticketStatusToText(TICKET_STATUS.ABSENT)).toBe("Absent");
  });

  it("F1.5.2 - Unknown Status Falls Through", () => {
    expect(ticketStatusToText("UNKNOWN" as any)).toBe("UNKNOWN");
  });
});
