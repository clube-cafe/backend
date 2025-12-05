import { Assinatura } from "../models/Assinatura";
import { PERIODO } from "../models/enums";
import { Transaction } from "sequelize";

export class AssinaturaRepository {
  async createAssinatura(
    user_id: string,
    valor: number,
    periodicidade: PERIODO,
    data_inicio: Date,
    transaction?: Transaction
  ) {
    const assinatura = await Assinatura.create(
      {
        user_id,
        valor,
        periodicidade,
        data_inicio,
      },
      { transaction }
    );

    return assinatura;
  }

  async getAllAssinaturas() {
    return await Assinatura.findAll();
  }

  async getAssinaturaById(id: string) {
    return await Assinatura.findByPk(id);
  }

  async getAssinaturasByUserId(user_id: string) {
    return await Assinatura.findAll({
      where: { user_id },
    });
  }

  async updateAssinatura(
    id: string,
    valor?: number,
    periodicidade?: PERIODO,
    data_inicio?: Date,
    transaction?: Transaction
  ) {
    const assinatura = await Assinatura.findByPk(id, { transaction });
    if (!assinatura) {
      throw new Error("Assinatura não encontrada");
    }

    if (valor !== undefined) assinatura.valor = valor;
    if (periodicidade) assinatura.periodicidade = periodicidade;
    if (data_inicio) assinatura.data_inicio = data_inicio;

    await assinatura.save({ transaction });
    return assinatura;
  }

  async deleteAssinatura(id: string, transaction?: Transaction) {
    const assinatura = await Assinatura.findByPk(id, { transaction });
    if (!assinatura) {
      throw new Error("Assinatura não encontrada");
    }

    await assinatura.destroy({ transaction });
    return true;
  }

  async deleteAssinaturasByUserId(user_id: string, transaction?: Transaction) {
    return await Assinatura.destroy({
      where: { user_id },
      transaction,
    });
  }
}
