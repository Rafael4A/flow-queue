import { describe, expect, it } from "vitest";
import { getPublicQueueRequest } from "./getPublicQueueRequest";

describe("getPublicQueueRequest", () => {
  it("F1.6.6 - Success", async () => {
    const mockQueue = {
      currentTicket: undefined,
      recentCalls: [],
      waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
    };

    const result = await getPublicQueueRequest();
    expect(result).toEqual(mockQueue);
  });
});
