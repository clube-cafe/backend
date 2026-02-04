import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { TIPO_USER } from "../models/enums";
import { Logger } from "../utils/Logger";
import { env } from "../config/env";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email e password são obrigatórios",
    });
  }

  try {
    const result = await authService.login(email, password);
    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    if (error.statusCode === 401) {
      return res.status(401).json({ message: error.message || "Invalid email or password" });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    Logger.error("Erro no login", error);
    return res.status(500).json({ message: "Error logging in" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await authService.logout(token);
    }

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    Logger.error("Erro no logout", error);
    return res.status(500).json({ message: "Error logging out" });
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  return await authService.isTokenBlacklisted(token);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        message: "Campos obrigatórios: nome, email, password",
      });
    }

    // Sempre cria usuário como ASSINANTE
    const result = await authService.register(nome, email, password, TIPO_USER.ASSINANTE);

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      ...result,
    });
  } catch (error: any) {
    if (error.statusCode === 409) {
      return res.status(409).json({ message: error.message });
    }
    Logger.error("Erro ao criar usuário", error);
    return res.status(500).json({
      message: "Erro ao criar o usuário",
      error: env.NODE_ENV === "development" ? error.message : "Erro interno do servidor",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (limit > 100 || limit < 1) {
      return res.status(400).json({ message: "Limit deve estar entre 1 e 100" });
    }
    if (offset < 0) {
      return res.status(400).json({ message: "Offset deve ser maior ou igual a 0" });
    }

    const users = await authService.getAllUsers(limit, offset);
    return res.json(users);
  } catch (error: any) {
    Logger.error("Erro ao obter usuários", error);
    return res.status(500).json({
      message: "Erro ao obter os usuários",
      error: env.NODE_ENV === "development" ? error.message : "Erro interno do servidor",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await authService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error: any) {
    Logger.error("Erro ao obter usuário", error);
    return res.status(500).json({
      message: "Erro ao obter o usuário",
      error: env.NODE_ENV === "development" ? error.message : "Erro interno do servidor",
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const user = await authService.getProfile(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error: any) {
    Logger.error("Erro ao obter perfil", error);
    return res.status(500).json({
      message: "Erro ao obter o perfil",
      error: env.NODE_ENV === "development" ? error.message : "Erro interno do servidor",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo_user } = req.body;

    if (tipo_user && !Object.values(TIPO_USER).includes(tipo_user)) {
      return res.status(400).json({
        message: "tipo_user deve ser ADMIN ou ASSINANTE",
      });
    }

    const user = await authService.updateUser(id, nome, email, tipo_user);
    return res.json(user);
  } catch (error: any) {
    Logger.error("Erro ao atualizar usuário", error);
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res.status(statusCode).json({
      message: error.message || "Erro ao atualizar o usuário",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { nome, email } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const user = await authService.updateProfile(userId, nome, email);
    return res.json(user);
  } catch (error: any) {
    Logger.error("Erro ao atualizar perfil", error);
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res.status(statusCode).json({
      message: error.message || "Erro ao atualizar o perfil",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await authService.deleteUser(id);
    return res.status(204).send();
  } catch (error: any) {
    Logger.error("Erro ao deletar usuário", error);
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res.status(statusCode).json({
      message: error.message || "Erro ao deletar o usuário",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Senha atual e nova senha são obrigatórias",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "A nova senha deve ter no mínimo 6 caracteres",
      });
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({
      message: "Senha alterada com sucesso",
    });
  } catch (error: any) {
    if (error.statusCode === 401) {
      return res.status(401).json({ message: error.message });
    }
    Logger.error("Erro ao alterar senha", error);
    return res.status(500).json({
      message: "Erro ao alterar a senha",
      error: env.NODE_ENV === "development" ? error.message : "Erro interno do servidor",
    });
  }
};
