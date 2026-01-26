import { UserRepository } from "../repository/UserRepository";
import { TIPO_USER } from "../models/enums";
import { comparePassword, generateToken, hashPassword } from "../utils/auth";

const userRepo = new UserRepository();
const tokenBlacklist = new Set<string>();

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepo.getUserByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.password) {
      throw new Error("User has no password");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
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

  async register(nome: string, email: string, password: string, tipo_user: TIPO_USER) {
    const existingUser = await userRepo.getUserByEmail(email);

    if (existingUser) {
      throw new Error("Email already registered");
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

  logout(token: string) {
    tokenBlacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
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
      throw new Error("User has no password");
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    await userRepo.updatePassword(userId, newPassword);
  }

  async getAllUsers() {
    return await userRepo.getAllUsers();
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
export { tokenBlacklist };
