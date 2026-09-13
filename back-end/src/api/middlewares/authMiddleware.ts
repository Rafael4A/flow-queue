import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "shared-code";

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication required: No token provided" });
  }

  try {
    // TODO: Use a secure secret key from environment variables
    const decoded = jwt.verify(token, "secret");
    // TODO: Create a proper type for req with user property - Maybe override with d.ts
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes((req as any).user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
