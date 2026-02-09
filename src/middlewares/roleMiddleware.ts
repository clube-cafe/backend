import { Request, Response, NextFunction } from "express";
import { TIPO_USER } from "../models/enums";

/**
 * Middleware para verificar se o usuário autenticado é ADMIN
 * Usa o tipo_user do JWT (já decodificado no authMiddleware)
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    return res.status(401).json({
      message: "Não autenticado",
    });
  }

  if (req.user.tipo_user !== TIPO_USER.ADMIN) {
    return res.status(403).json({
      message: "Acesso negado. Apenas administradores podem acessar este recurso.",
    });
  }

  next();
};
