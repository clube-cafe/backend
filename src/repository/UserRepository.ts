import { User } from "../models/User";
import { TIPO_USER } from "../models/enums";

export class UserRepository {
  async createUser(nome: string, email: string, tipo_user: TIPO_USER) {
    const user = await User.create({
      nome,
      email,
      tipo_user,
    });

    return user;
  }

  async getAllUsers() {
    return await User.findAll();
  }

  async getUserById(id: string) {
    return await User.findByPk(id);
  }

  async getUserByEmail(email: string) {
    return await User.findOne({
      where: { email },
    });
  }

  async updateUser(id: string, nome?: string, email?: string, tipo_user?: TIPO_USER) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (nome) user.nome = nome;
    if (email) user.email = email;
    if (tipo_user) user.tipo_user = tipo_user;

    await user.save();
    return user;
  }

  async deleteUser(id: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await user.destroy();
    return true;
  }
}
