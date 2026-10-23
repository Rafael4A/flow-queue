import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  TEST_DESK_1_ACCOUNT,
  TEST_TOTEM_ACCOUNT,
  USER_ROLE,
} from "shared-code";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JWT_SECRET } from "../../testSetup";
import { requireRole, verifyJwt } from "./authMiddleware";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    cookies: { token: overrides.cookies?.token },
    user: overrides.user,
    ...overrides,
  } as unknown as Request;
}

function createMockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    locals: {},
  } as unknown as Response;
}

function createMockNext(): NextFunction {
  return vi.fn();
}

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyJwt", () => {
    it("B2.2.1 - No Token", () => {
      const req = createMockReq();
      const res = createMockRes();

      verifyJwt(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required: No token provided",
      });
    });

    it("B2.2.2 - Invalid Token", () => {
      const req = createMockReq({ cookies: { token: "invalid-token" } });
      const res = createMockRes();

      verifyJwt(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token",
      });
    });

    it("B2.2.3 - Valid Token Attaches User", () => {
      const token = jwt.sign(
        {
          sub: TEST_DESK_1_ACCOUNT.subject,
          role: USER_ROLE.DESK,
          deskId: TEST_DESK_1_ACCOUNT.deskId,
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );
      const req = createMockReq({ cookies: { token } });
      const res = createMockRes();
      const next = createMockNext();

      verifyJwt(req, res, next);

      expect(req.user?.sub).toBe(TEST_DESK_1_ACCOUNT.subject);
      expect(req.user?.role).toBe(USER_ROLE.DESK);
      expect(req.user?.deskId).toBe("Desk 1");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("B2.2.4 - Allowed Role", () => {
      const req = createMockReq({
        user: { sub: TEST_DESK_1_ACCOUNT.subject, role: USER_ROLE.DESK },
      });
      const res = createMockRes();
      const next = createMockNext();

      const middleware = requireRole([USER_ROLE.DESK]);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("B2.2.5 - Forbidden Role", () => {
      const req = createMockReq({
        user: { sub: TEST_TOTEM_ACCOUNT.subject, role: USER_ROLE.TOTEM },
      });
      const res = createMockRes();

      const middleware = requireRole([USER_ROLE.DESK]);
      middleware(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    it("B2.2.6 - No User Attached", () => {
      const req = createMockReq({ user: undefined });
      const res = createMockRes();

      const middleware = requireRole([USER_ROLE.DESK]);
      middleware(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });
  });
});
