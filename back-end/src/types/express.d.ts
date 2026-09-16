import type { AuthPayload } from "shared-code";

// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
