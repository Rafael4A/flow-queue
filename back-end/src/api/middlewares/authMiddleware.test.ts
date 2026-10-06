import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
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
    it("3.3.1 - No Token", () => {
      const req = createMockReq();
      const res = createMockRes();

      verifyJwt(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required: No token provided",
      });
    });

    it("3.3.2 - Invalid Token", () => {
      const req = createMockReq({ cookies: { token: "invalid-token" } });
      const res = createMockRes();

      verifyJwt(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token",
      });
    });

    it("3.3.3 - Valid Token Attaches User", () => {
      const token = jwt.sign(
        { sub: "desk-1", role: "DESK", deskId: "Desk 1" },
        JWT_SECRET,
        { expiresIn: "1h" },
      );
      const req = createMockReq({ cookies: { token } });
      const res = createMockRes();
      const next = createMockNext();

      verifyJwt(req, res, next);

      expect(req.user?.sub).toBe("desk-1");
      expect(req.user?.role).toBe("DESK");
      expect(req.user?.deskId).toBe("Desk 1");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("3.3.4 - Allowed Role", () => {
      const req = createMockReq({
        user: { sub: "desk-1", role: "DESK" },
      });
      const res = createMockRes();
      const next = createMockNext();

      const middleware = requireRole(["DESK"]);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("3.3.5 - Forbidden Role", () => {
      const req = createMockReq({
        user: { sub: "totem-main", role: "TOTEM" },
      });
      const res = createMockRes();

      const middleware = requireRole(["DESK"]);
      middleware(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    it("3.3.6 - No User Attached", () => {
      const req = createMockReq({ user: undefined });
      const res = createMockRes();

      const middleware = requireRole(["DESK"]);
      middleware(req, res, createMockNext());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });
  });
});
