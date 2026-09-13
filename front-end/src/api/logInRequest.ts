import type { AuthPayload, LogInRequestPayload } from "shared-code";
import type { APIError } from "../types";

export async function logInRequest(
  args: LogInRequestPayload,
): Promise<AuthPayload> {
  return fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        const error = new Error(data.error || "Failed to log in") as APIError;
        error.status = res.status;
        throw error;
      });
    }
    return res.json();
  });
}
