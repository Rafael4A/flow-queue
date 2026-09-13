import type { Request, Response } from "express";
import { authenticateUser } from "../services";

export function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password missing" });
  }

  try {
    const { token, user } = authenticateUser(username, password);
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "strict",
      maxAge: 3600000,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
}
