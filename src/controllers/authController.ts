import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { TIPO_USER } from "../models/enums";
import { ValidationError, UnauthorizedError, NotFoundError } from "../utils/Errors";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email e senha são obrigatórios");
  }

  const result = await authService.login(email, password);
  return res.status(200).json({ message: "Login realizado com sucesso", ...result });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    await authService.logout(token);
  }
  return res.status(200).json({ message: "Logout realizado com sucesso" });
};

export const register = async (req: Request, res: Response) => {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    throw new ValidationError("Campos obrigatórios: nome, email, password");
  }

  const result = await authService.register(nome, email, password);
  return res.status(201).json({ message: "Usuário criado com sucesso", ...result });
};

export const getAllUsers = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  if (limit > 100 || limit < 1) {
    throw new ValidationError("Limit deve estar entre 1 e 100");
  }
  if (offset < 0) {
    throw new ValidationError("Offset deve ser maior ou igual a 0");
  }

  const users = await authService.getAllUsers(limit, offset);
  return res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await authService.getUserById(id);
  if (!user) {
    throw new NotFoundError("Usuário");
  }
  return res.json(user);
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("Usuário não autenticado");
  }
  const user = await authService.getProfile(userId);
  if (!user) {
    throw new NotFoundError("Usuário");
  }
  return res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email, tipo_user } = req.body;

  if (tipo_user && !Object.values(TIPO_USER).includes(tipo_user)) {
    throw new ValidationError("tipo_user deve ser ADMIN ou ASSINANTE");
  }

  const user = await authService.updateUser(id, nome, email, tipo_user);
  return res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { nome, email } = req.body;
  if (!userId) {
    throw new UnauthorizedError("Usuário não autenticado");
  }
  const user = await authService.updateProfile(userId, nome, email);
  return res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await authService.deleteUser(id);
  return res.status(204).send();
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Usuário não autenticado");
  }
  if (!currentPassword || !newPassword) {
    throw new ValidationError("Senha atual e nova senha são obrigatórias");
  }
  if (newPassword.length < 6) {
    throw new ValidationError("A nova senha deve ter no mínimo 6 caracteres");
  }

  await authService.changePassword(userId, currentPassword, newPassword);
  return res.status(200).json({ message: "Senha alterada com sucesso" });
};
