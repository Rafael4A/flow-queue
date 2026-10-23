import jwt from "jsonwebtoken";
import {
  TEST_ACCOUNTS,
  TEST_DESK_1_ACCOUNT,
  TEST_TOTEM_ACCOUNT,
  USER_ROLE,
  type AuthPayload,
} from "shared-code";
import { describe, expect, it, vi } from "vitest";
import { JWT_SECRET } from "../../testSetup";
import { authenticateUser } from "./authService";

vi.mock("../../../data/accounts.json", () => ({
  default: TEST_ACCOUNTS,
}));

describe("authService", () => {
  it("B2.1.1 - Valid Login - TOTEM Role", () => {
    const result = authenticateUser(
      TEST_TOTEM_ACCOUNT.subject,
      TEST_TOTEM_ACCOUNT.password,
    );

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(result.user.sub).toBe(TEST_TOTEM_ACCOUNT.subject);
    expect(result.user.role).toBe(USER_ROLE.TOTEM);
    expect(result.user.deskId).toBeUndefined();

    const decoded = jwt.verify(result.token, JWT_SECRET) as AuthPayload;
    expect(decoded.sub).toBe(TEST_TOTEM_ACCOUNT.subject);
    expect(decoded.role).toBe(USER_ROLE.TOTEM);
  });

  it("B2.1.2 - Valid Login - DESK Role with deskId", () => {
    const result = authenticateUser(
      TEST_DESK_1_ACCOUNT.subject,
      TEST_DESK_1_ACCOUNT.password,
    );

    expect(result.user.sub).toBe(TEST_DESK_1_ACCOUNT.subject);
    expect(result.user.role).toBe(USER_ROLE.DESK);
    expect(result.user.deskId).toBe(TEST_DESK_1_ACCOUNT.deskId);
  });

  it("B2.1.3 - Invalid Username", () => {
    expect(() =>
      authenticateUser("nonexistent", TEST_DESK_1_ACCOUNT.password),
    ).toThrow("Invalid username or password");
  });

  it("B2.1.4 - Invalid Password", () => {
    expect(() =>
      authenticateUser(TEST_DESK_1_ACCOUNT.subject, "wrong-password"),
    ).toThrow("Invalid username or password");
  });

  it("B2.1.5 - JWT Token Expiration", () => {
    const result = authenticateUser(
      TEST_DESK_1_ACCOUNT.subject,
      TEST_DESK_1_ACCOUNT.password,
    );
    const decoded = jwt.verify(result.token, JWT_SECRET) as { exp: number };

    expect(decoded.exp).toBeDefined();
    const now = Math.floor(Date.now() / 1000);
    expect(decoded.exp).toBeGreaterThan(now);
    expect(decoded.exp).toBeLessThanOrEqual(now + 3601);
  });
});
