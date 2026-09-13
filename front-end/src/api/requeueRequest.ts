import type { RequeueTicketRequestPayload, Ticket } from "shared-code";
import type { APIError } from "../types";

export async function requeueRequest(
  args: RequeueTicketRequestPayload,
): Promise<Ticket> {
  return fetch("/api/desk/tickets/requeue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        const error = new Error(
          data.error || "Failed to requeue ticket",
        ) as APIError;
        error.status = res.status;
        throw error;
      });
    }
    return res.json();
  });
}
