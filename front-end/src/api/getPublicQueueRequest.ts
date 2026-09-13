import type { PublicQueueView } from "shared-code";
import type { APIError } from "../types";

export async function getPublicQueueRequest(): Promise<PublicQueueView> {
  return fetch("/api/queue/public ").then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        const error = new Error(
          data.error || "Failed to fetch room",
        ) as APIError;
        error.status = res.status;
        throw error;
      });
    }
    return res.json();
  });
}
