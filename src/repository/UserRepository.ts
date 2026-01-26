import { User } from "../models/User";
import { TIPO_USER } from "../models/enums";
import { NotFoundError, ValidationError, ConflictError } from "../utils/Errors";
import { Validators } from "../utils/Validators";
import { hashPassword } from "../utils/auth";

export class UserRepository {
  async createUser(nome: string, email: string, tipo_user: TIPO_USER, password: string) {
    if (!Validators.isValidString(nome, 3)) {
      throw new ValidationError("Nome deve ter pelo menos 3 caracteres");
    }

    if (!Validators.isValidEmail(email)) {
      throw new ValidationError("Email inválido");
    }

    if (!password) {
      throw new ValidationError("Password é obrigatório");
    }

    if (password.length < 6) {
      throw new ValidationError("Password deve ter pelo menos 6 caracteres");
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw new ConflictError("Este email já está registrado");
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      nome: Validators.sanitizeString(nome),
      email: email.toLowerCase(),
      tipo_user,
      password: hashedPassword,
    });

    return user;
  }

  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ["deletedAt", "password"] },
      order: [["createdAt", "DESC"]],
    });
  }

  async getUserById(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError("Usuário");
    }

    return user;
  }

  async getUserByEmail(email: string) {
    if (!Validators.isValidEmail(email)) {
      throw new ValidationError("Email inválido");
    }

    return await User.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async updateUser(id: string, nome?: string, email?: string, tipo_user?: TIPO_USER) {
    const user = await this.getUserById(id);

    if (nome && !Validators.isValidString(nome, 3)) {
      throw new ValidationError("Nome deve ter pelo menos 3 caracteres");
    }

    if (email) {
      if (!Validators.isValidEmail(email)) {
        throw new ValidationError("Email inválido");
      }

      if (email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({
          where: { email: email.toLowerCase() },
        });
        if (existingUser) {
          throw new ConflictError("Este email já está registrado");
        }
      }
    }

    if (nome) user.nome = Validators.sanitizeString(nome);
    if (email) user.email = email.toLowerCase();
    if (tipo_user) user.tipo_user = tipo_user;

    await user.save();
    return user;
  }

  async updatePassword(id: string, newPassword: string) {
    const user = await this.getUserById(id);

    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError("A senha deve ter no mínimo 6 caracteres");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    await user.save();
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    await user.destroy();
    return true;
  }
}
