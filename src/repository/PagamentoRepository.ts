import { Pagamento } from "../models/Pagamento";
import { PAGAMENTO_ENUM } from "../models/enums";
import { Op } from "sequelize";
import { Transaction } from "sequelize";

export class PagamentoRepository {
  async createPagamento(
    user_id: string,
    valor: number,
    data_pagamento: Date,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string,
    transaction?: Transaction
  ) {
    const pagamento = await Pagamento.create(
      {
        user_id,
        valor,
        data_pagamento,
        forma_pagamento,
        observacao: observacao || null,
      },
      { transaction }
    );

    return pagamento;
  }

  async getAllPagamentos(limit: number = 50, offset: number = 0) {
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 50;
    if (offset < 0) offset = 0;

    return await Pagamento.findAll({
      order: [["data_pagamento", "DESC"]],
      limit,
      offset,
    });
  }

  async getPagamentoById(id: string) {
    return await Pagamento.findByPk(id);
  }

  async getPagamentosByUserId(user_id: string) {
    return await Pagamento.findAll({
      where: { user_id },
      order: [["data_pagamento", "DESC"]],
    });
  }

  async getPagamentosByFormaPagamento(forma_pagamento: PAGAMENTO_ENUM) {
    return await Pagamento.findAll({
      where: { forma_pagamento },
      order: [["data_pagamento", "DESC"]],
    });
  }

  async getPagamentosByPeriodo(data_inicio: Date, data_fim: Date) {
    return await Pagamento.findAll({
      where: {
        data_pagamento: {
          [Op.between]: [data_inicio, data_fim],
        },
      },
      order: [["data_pagamento", "DESC"]],
    });
  }

  async updatePagamento(
    id: string,
    valor?: number,
    data_pagamento?: Date,
    forma_pagamento?: PAGAMENTO_ENUM,
    observacao?: string,
    transaction?: Transaction
  ) {
    const pagamento = await Pagamento.findByPk(id, { transaction });
    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    if (valor !== undefined) pagamento.valor = valor;
    if (data_pagamento) pagamento.data_pagamento = data_pagamento;
    if (forma_pagamento) pagamento.forma_pagamento = forma_pagamento;
    if (observacao !== undefined) pagamento.observacao = observacao;

    await pagamento.save({ transaction });
    return pagamento;
  }

  async deletePagamento(id: string, transaction?: Transaction) {
    const pagamento = await Pagamento.findByPk(id, { transaction });
    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    await pagamento.destroy({ transaction });
    return true;
  }

  async deletePagamentosByUserId(user_id: string, transaction?: Transaction) {
    return await Pagamento.destroy({
      where: { user_id },
      transaction,
    });
  }

  async getTotalPagamentos() {
    const result = (await Pagamento.findAll({
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalPagamentosByUser(user_id: string) {
    const result = (await Pagamento.findAll({
      where: { user_id },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }
}
