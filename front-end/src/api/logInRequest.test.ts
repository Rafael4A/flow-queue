import { describe, expect, it } from "vitest";
import type { APIError } from "../types";
import { logInRequest } from "./logInRequest";

describe("logInRequest", () => {
  it("4.7.14 - Success", async () => {
    const mockUser = { sub: "desk-1", role: "DESK", deskId: "Desk 1" };

    const result = await logInRequest({ username: "desk-1", password: "pwd" });
    expect(result).toEqual(mockUser);
  });

  it("4.7.15 - 401 Error", async () => {
    const error = (await logInRequest({
      username: "desk-1",
      password: "wrong",
    }).catch((e) => e)) as APIError;
    expect(error.status).toBe(401);
  });
});
