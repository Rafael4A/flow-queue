import { TEST_DESK_1_ACCOUNT, USER_ROLE } from "shared-code";
import { describe, expect, it } from "vitest";
import type { APIError } from "../types";
import { logInRequest } from "./logInRequest";

describe("logInRequest", () => {
  it("F1.6.14 - Success", async () => {
    const mockUser = {
      sub: TEST_DESK_1_ACCOUNT.subject,
      role: USER_ROLE.DESK,
      deskId: TEST_DESK_1_ACCOUNT.deskId,
    };

    const result = await logInRequest({
      username: TEST_DESK_1_ACCOUNT.subject,
      password: TEST_DESK_1_ACCOUNT.password,
    });
    expect(result).toEqual(mockUser);
  });

  it("F1.6.15 - 401 Error", async () => {
    const error = (await logInRequest({
      username: TEST_DESK_1_ACCOUNT.subject,
      password: "wrong",
    }).catch((e) => e)) as APIError;
    expect(error.status).toBe(401);
  });
});
