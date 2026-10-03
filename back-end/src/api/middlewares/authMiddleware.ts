import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload, UserRole } from "shared-code";

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication required: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = decoded;
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
