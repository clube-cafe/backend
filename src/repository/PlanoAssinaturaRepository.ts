import { PlanoAssinatura } from "../models/PlanoAssinatura";
import { PERIODO } from "../models/enums";
import { Transaction } from "sequelize";
import { Logger } from "../utils/Logger";
import { NotFoundError } from "../utils/Errors";

export class PlanoAssinaturaRepository {
  async createPlano(
    nome: string,
    descricao: string,
    valor: number,
    periodicidade: PERIODO,
    transaction?: Transaction
  ) {
    const plano = await PlanoAssinatura.create(
      {
        nome,
        descricao,
        valor,
        periodicidade,
      },
      { transaction }
    );

    Logger.debug("Plano de assinatura criado no repositório", {
      planoId: plano.id,
    });

    return plano;
  }

  async getAllPlanos(limit: number = 50, offset: number = 0, apenasAtivos: boolean = true) {
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 50;
    if (offset < 0) offset = 0;

    const where = apenasAtivos ? { ativo: true } : {};

    return await PlanoAssinatura.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  }

  async getPlanoById(id: string, transaction?: Transaction) {
    const plano = await PlanoAssinatura.findByPk(id, { transaction });
    if (!plano) {
      throw new NotFoundError("Plano de assinatura não encontrado");
    }
    return plano;
  }

  async getPlanoByName(nome: string, transaction?: Transaction) {
    return await PlanoAssinatura.findOne({
      where: { nome },
      transaction,
    });
  }

  async updatePlano(
    id: string,
    nome?: string,
    descricao?: string,
    valor?: number,
    periodicidade?: PERIODO,
    ativo?: boolean,
    transaction?: Transaction
  ) {
    const plano = await PlanoAssinatura.findByPk(id, { transaction });
    if (!plano) {
      throw new NotFoundError("Plano de assinatura não encontrado");
    }

    if (nome !== undefined) plano.nome = nome;
    if (descricao !== undefined) plano.descricao = descricao;
    if (valor !== undefined) plano.valor = valor;
    if (periodicidade !== undefined) plano.periodicidade = periodicidade;
    if (ativo !== undefined) plano.ativo = ativo;

    await plano.save({ transaction });

    Logger.debug("Plano de assinatura atualizado no repositório", { planoId: id });

    return plano;
  }

  async deletePlano(id: string, transaction?: Transaction) {
    const plano = await PlanoAssinatura.findByPk(id, { transaction });
    if (!plano) {
      throw new NotFoundError("Plano de assinatura não encontrado");
    }

    await plano.destroy({ transaction });

    Logger.debug("Plano de assinatura deletado no repositório", { planoId: id });

    return true;
  }
}
