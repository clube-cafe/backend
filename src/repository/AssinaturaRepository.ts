import { Assinatura } from "../models/Assinatura";
import { PERIODO, STATUS_ASSINATURA } from "../models/enums";
import { Transaction } from "sequelize";
import { Logger } from "../utils/Logger";
import { NotFoundError } from "../utils/Errors";

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

    Logger.debug("Assinatura criada no repositório", {
      assinaturaId: assinatura.id,
      user_id,
    });

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

  async getAssinaturasAtivasByUserId(user_id: string) {
    return await Assinatura.findAll({
      where: {
        user_id,
        status: STATUS_ASSINATURA.ATIVA,
      },
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
      throw new NotFoundError("Assinatura não encontrada");
    }

    if (valor !== undefined) assinatura.valor = valor;
    if (periodicidade) assinatura.periodicidade = periodicidade;
    if (data_inicio) assinatura.data_inicio = data_inicio;

    await assinatura.save({ transaction });

    Logger.debug("Assinatura atualizada no repositório", { assinaturaId: id });

    return assinatura;
  }

  async deleteAssinatura(id: string, transaction?: Transaction) {
    const assinatura = await Assinatura.findByPk(id, { transaction });
    if (!assinatura) {
      throw new NotFoundError("Assinatura não encontrada");
    }

    await assinatura.destroy({ transaction });

    Logger.debug("Assinatura deletada no repositório", { assinaturaId: id });

    return true;
  }

  async deleteAssinaturasByUserId(user_id: string, transaction?: Transaction) {
    return await Assinatura.destroy({
      where: { user_id },
      transaction,
    });
  }
}
