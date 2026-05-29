import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { authService } from "../services/AuthService";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  if (await authService.isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token invalidado. Faça login novamente." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email, tipo_user: decoded.tipo_user };
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido." });
  }
};
