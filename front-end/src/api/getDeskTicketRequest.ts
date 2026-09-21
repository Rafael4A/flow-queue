import type { Ticket } from "shared-code";
import type { APIError } from "../types";

export async function getDeskTicketRequest(): Promise<Ticket | undefined> {
  return fetch("/api/desk/ticket ").then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        const error = new Error(
          data.message || "Failed to fetch room",
        ) as APIError;
        error.status = res.status;
        throw error;
      });
    }
    return res.json();
  });
}
