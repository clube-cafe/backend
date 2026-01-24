import { User } from "../models/User";
import { TIPO_USER } from "../models/enums";
import { NotFoundError, ValidationError, ConflictError } from "../utils/Errors";
import { Validators } from "../utils/Validators";

export class UserRepository {
  async createUser(nome: string, email: string, tipo_user: TIPO_USER) {
    if (!Validators.isValidString(nome, 3)) {
      throw new ValidationError("Nome deve ter pelo menos 3 caracteres");
    }

    if (!Validators.isValidEmail(email)) {
      throw new ValidationError("Email inválido");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError("Este email já está registrado");
    }

    const user = await User.create({
      nome: Validators.sanitizeString(nome),
      email: email.toLowerCase(),
      tipo_user,
    });

    return user;
  }

  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ["deletedAt"] },
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

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    await user.destroy();
    return true;
  }
}
