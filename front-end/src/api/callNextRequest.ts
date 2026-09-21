import type { Ticket } from "shared-code";
import type { APIError } from "../types";

export async function callNextRequest(): Promise<Ticket | { message: string }> {
  return fetch("/api/desk/tickets/call-next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        const error = new Error(
          data.message || "Failed to call next ticket",
        ) as APIError;
        error.status = res.status;
        throw error;
      });
    }
    return res.json();
  });
}
