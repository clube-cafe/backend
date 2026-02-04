import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { isTokenBlacklisted } from "../controllers/authController";

/**
 * Middleware de autenticação JWT com verificação de blacklist
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Verifica se o token está na blacklist
  if (await isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been invalidated. Please login again." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded as { id: string; username: string };
    next();
  } catch {
    return res.status(400).json({ message: "Invalid token." });
  }
};
