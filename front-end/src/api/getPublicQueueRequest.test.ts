import { describe, expect, it } from "vitest";
import { getPublicQueueRequest } from "./getPublicQueueRequest";

describe("getPublicQueueRequest", () => {
  it("4.7.6 - Success", async () => {
    const mockQueue = {
      currentTicket: undefined,
      recentCalls: [],
      waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
    };

    const result = await getPublicQueueRequest();
    expect(result).toEqual(mockQueue);
  });
});
