import jwt from "jsonwebtoken";
import { type AuthPayload, type UserRole } from "shared-code";
import _accounts from "../../../data/accounts.json";

const accounts = _accounts as {
  subject: string;
  password: string;
  role: UserRole;
  deskId?: string;
}[];

export function authenticateUser(
  username: string,
  password: string,
): { token: string; user: AuthPayload } {
  const account = accounts.find((account) => account.subject === username);
  if (!account || account.password !== password) {
    throw new Error("Invalid username or password");
  }

  const user: AuthPayload = {
    sub: account.subject,
    role: account.role,
    deskId: account.deskId,
  };

  const token = generateToken(user);
  return { token, user };
}

function generateToken(user: AuthPayload): string {
  // TODO: Use a secure secret key from environment variables
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "1h" });
}
