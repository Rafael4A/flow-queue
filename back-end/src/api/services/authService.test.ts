import jwt from "jsonwebtoken";
import type { AuthPayload } from "shared-code";
import { describe, expect, it, vi } from "vitest";
import { JWT_SECRET } from "../../testSetup";
import { authenticateUser } from "./authService";

vi.mock("../../../data/accounts.json", () => ({
  default: [
    { subject: "totem-main", password: "pwd", role: "TOTEM" },
    { subject: "desk-1", password: "pwd", role: "DESK", deskId: "Desk 1" },
    { subject: "desk-2", password: "pwd", role: "DESK", deskId: "Desk 2" },
  ],
}));

describe("authService", () => {
  it("B2.1.1 - Valid Login - TOTEM Role", () => {
    const result = authenticateUser("totem-main", "pwd");

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(result.user.sub).toBe("totem-main");
    expect(result.user.role).toBe("TOTEM");
    expect(result.user.deskId).toBeUndefined();

    const decoded = jwt.verify(result.token, JWT_SECRET) as AuthPayload;
    expect(decoded.sub).toBe("totem-main");
    expect(decoded.role).toBe("TOTEM");
  });

  it("B2.1.2 - Valid Login - DESK Role with deskId", () => {
    const result = authenticateUser("desk-1", "pwd");

    expect(result.user.sub).toBe("desk-1");
    expect(result.user.role).toBe("DESK");
    expect(result.user.deskId).toBe("Desk 1");
  });

  it("B2.1.3 - Invalid Username", () => {
    expect(() => authenticateUser("nonexistent", "pwd")).toThrow(
      "Invalid username or password",
    );
  });

  it("B2.1.4 - Invalid Password", () => {
    expect(() => authenticateUser("desk-1", "wrong-password")).toThrow(
      "Invalid username or password",
    );
  });

  it("B2.1.5 - JWT Token Expiration", () => {
    const result = authenticateUser("desk-1", "pwd");
    const decoded = jwt.verify(result.token, JWT_SECRET) as { exp: number };

    expect(decoded.exp).toBeDefined();
    const now = Math.floor(Date.now() / 1000);
    expect(decoded.exp).toBeGreaterThan(now);
    expect(decoded.exp).toBeLessThanOrEqual(now + 3601);
  });
});
