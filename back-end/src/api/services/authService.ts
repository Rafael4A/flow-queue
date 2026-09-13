import jwt from "jsonwebtoken";
import { USER_ROLE, type AuthPayload } from "shared-code";

const accounts = [
  { subject: "totem-main", password: "pwd", role: USER_ROLE.TOTEM },
  {
    subject: "desk-1",
    password: "pwd",
    role: USER_ROLE.DESK,
    deskId: "Desk 1",
  },
  {
    subject: "desk-2",
    password: "pwd",
    role: USER_ROLE.DESK,
    deskId: "Desk 2",
  },
];

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
  return jwt.sign(user, "secret", { expiresIn: "1h" });
}
