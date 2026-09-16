import type { Ticket, TicketTypePayload } from "shared-code";
import type { APIError } from "../types";

export async function issueTicketRequest(
  args: TicketTypePayload,
): Promise<Ticket> {
  return fetch("/api/totem/tickets/issue", {
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
          data.error || "Failed to issue ticket",
        ) as APIError;
        error.status = res.status;
        throw error;
      });
    }
    return res.json();
  });
}
