import type { UserRole } from "../constants";

export interface AuthPayload {
  sub: string;
  role: UserRole;
  deskId?: string;
}
