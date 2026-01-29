import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repository/UserRepository";
import { TIPO_USER } from "../models/enums";
import { Logger } from "../utils/Logger";

const userRepo = new UserRepository();

/**
 * Middleware para verificar se o usuário autenticado é ADMIN
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pega o userId do objeto user que foi decodificado no middleware de autenticação
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Não autenticado",
      });
    }

    const user = await userRepo.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    if (user.tipo_user !== TIPO_USER.ADMIN) {
      return res.status(403).json({
        message: "Acesso negado. Apenas administradores podem acessar este recurso.",
      });
    }

    next();
  } catch (error) {
    Logger.error("Erro ao verificar permissões", error);
    return res.status(500).json({
      message: "Erro ao verificar permissões",
    });
  }
};
