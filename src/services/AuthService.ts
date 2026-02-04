import { UserRepository } from "../repository/UserRepository";
import { TIPO_USER } from "../models/enums";
import { comparePassword, generateToken } from "../utils/auth";
import { UnauthorizedError, ConflictError, ValidationError } from "../utils/Errors";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { Op } from "sequelize";
import { Logger } from "../utils/Logger";

const userRepo = new UserRepository();

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepo.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (!user.password) {
      throw new ValidationError("Usuário não possui senha cadastrada");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_user: user.tipo_user,
      },
    };
  }

  async register(
    nome: string,
    email: string,
    password: string,
    tipo_user: TIPO_USER = TIPO_USER.ASSINANTE
  ) {
    const existingUser = await userRepo.getUserByEmail(email);

    if (existingUser) {
      throw new ConflictError("Email já está registrado");
    }

    const user = await userRepo.createUser(nome, email, tipo_user, password);
    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_user: user.tipo_user,
      },
    };
  }

  async logout(token: string) {
    try {
      const decoded = require("jsonwebtoken").decode(token);
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 3600000);

      await TokenBlacklist.create({
        token,
        expiresAt,
      });

      await this.cleanupExpiredTokens();
    } catch (error) {
      Logger.error("Erro ao adicionar token à blacklist", error);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklisted = await TokenBlacklist.findOne({
        where: { token },
      });
      return !!blacklisted;
    } catch (error) {
      Logger.error("Erro ao verificar blacklist", error);
      return false;
    }
  }

  private async cleanupExpiredTokens() {
    try {
      await TokenBlacklist.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      });
    } catch (error) {
      Logger.error("Erro ao limpar tokens expirados", error);
    }
  }

  async getProfile(userId: string) {
    return await userRepo.getUserById(userId);
  }

  async updateProfile(userId: string, nome?: string, email?: string) {
    return await userRepo.updateUser(userId, nome, email);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepo.getUserById(userId);

    if (!user.password) {
      throw new ValidationError("Usuário não possui senha cadastrada");
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Senha atual incorreta");
    }

    await userRepo.updatePassword(userId, newPassword);
  }

  async getAllUsers(limit: number = 50, offset: number = 0) {
    return await userRepo.getAllUsers(limit, offset);
  }

  async getUserById(id: string) {
    return await userRepo.getUserById(id);
  }

  async updateUser(id: string, nome?: string, email?: string, tipo_user?: TIPO_USER) {
    return await userRepo.updateUser(id, nome, email, tipo_user);
  }

  async deleteUser(id: string) {
    return await userRepo.deleteUser(id);
  }
}

export const authService = new AuthService();
