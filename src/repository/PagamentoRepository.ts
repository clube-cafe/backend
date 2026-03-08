import { Pagamento } from "../models/Pagamento";
import { PAGAMENTO_ENUM, STATUS } from "../models/enums";
import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { NotFoundError } from "../utils/Errors";

export class PagamentoRepository {
  // ========== CRIAÇÃO ==========

  async createPagamento(
    user_id: string,
    valor: number,
    data_vencimento: Date,
    descricao: string,
    status: STATUS = STATUS.PENDENTE,
    transaction?: Transaction,
    assinatura_id?: string
  ) {
    const pagamento = await Pagamento.create(
      {
        user_id,
        valor,
        data_vencimento,
        descricao,
        status,
        assinatura_id,
      },
      { transaction }
    );

    return pagamento;
  }

  // ========== LEITURA ==========

  async getAllPagamentos(limit: number = 50, offset: number = 0) {
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 50;
    if (offset < 0) offset = 0;

    return await Pagamento.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async getPagamentoById(id: string, transaction?: Transaction) {
    return await Pagamento.findByPk(id, { transaction });
  }

  async getPagamentosByUserId(user_id: string) {
    return await Pagamento.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });
  }

  async getPagamentosByStatus(status: STATUS) {
    return await Pagamento.findAll({
      where: { status },
      order: [["data_vencimento", "ASC"]],
    });
  }

  async getPagamentosByUserIdAndStatus(user_id: string, status?: STATUS) {
    const where: any = { user_id };
    if (status) where.status = status;

    return await Pagamento.findAll({
      where,
      order: [["data_vencimento", "ASC"]],
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
        status: STATUS.PAGO,
      },
      order: [["data_pagamento", "DESC"]],
    });
  }

  async getPagamentosVencidos() {
    const hoje = new Date();
    return await Pagamento.findAll({
      where: {
        data_vencimento: {
          [Op.lt]: hoje,
        },
        status: {
          [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO],
        },
      },
      order: [["data_vencimento", "ASC"]],
    });
  }

  async getPagamentosVencendo(data_inicio: Date, data_fim: Date) {
    return await Pagamento.findAll({
      where: {
        data_vencimento: {
          [Op.between]: [data_inicio, data_fim],
        },
        status: STATUS.PENDENTE,
      },
      order: [["data_vencimento", "ASC"]],
    });
  }

  async getPagamentosPendentesPorVencimento(limit: number = 50, offset: number = 0) {
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 50;
    if (offset < 0) offset = 0;

    return await Pagamento.findAll({
      where: {
        status: {
          [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO],
        },
      },
      order: [["data_vencimento", "ASC"]],
      limit,
      offset,
    });
  }

  // ========== ATUALIZAÇÃO ==========

  async updatePagamento(
    id: string,
    valor?: number,
    data_vencimento?: Date,
    descricao?: string,
    status?: STATUS,
    forma_pagamento?: PAGAMENTO_ENUM,
    observacao?: string,
    transaction?: Transaction
  ) {
    const pagamento = await Pagamento.findByPk(id, { transaction });
    if (!pagamento) {
      throw new NotFoundError("Pagamento");
    }

    if (valor !== undefined) pagamento.valor = valor;
    if (data_vencimento) pagamento.data_vencimento = data_vencimento;
    if (descricao) pagamento.descricao = descricao;
    if (status) pagamento.status = status;
    if (forma_pagamento) pagamento.forma_pagamento = forma_pagamento;
    if (observacao !== undefined) pagamento.observacao = observacao;

    await pagamento.save({ transaction });
    return pagamento;
  }

  async updateStatusPagamento(id: string, status: STATUS, transaction?: Transaction) {
    const pagamento = await Pagamento.findByPk(id, { transaction });
    if (!pagamento) {
      throw new NotFoundError("Pagamento");
    }

    pagamento.status = status;
    await pagamento.save({ transaction });
    return pagamento;
  }

  async registrarPagamento(
    id: string,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string,
    transaction?: Transaction
  ) {
    const pagamento = await Pagamento.findByPk(id, { transaction });
    if (!pagamento) {
      throw new NotFoundError("Pagamento");
    }

    pagamento.status = STATUS.PAGO;
    pagamento.forma_pagamento = forma_pagamento;
    pagamento.data_pagamento = new Date();
    if (observacao !== undefined) pagamento.observacao = observacao;

    await pagamento.save({ transaction });
    return pagamento;
  }

  // ========== EXCLUSÃO ==========

  async deletePagamento(id: string, transaction?: Transaction) {
    const pagamento = await Pagamento.findByPk(id, { transaction });
    if (!pagamento) {
      throw new NotFoundError("Pagamento");
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

  // ========== TOTAIS ==========

  async getTotalPagamentos() {
    const result = (await Pagamento.findAll({
      where: { status: STATUS.PAGO },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalPagamentosByUser(user_id: string) {
    const result = (await Pagamento.findAll({
      where: { user_id, status: STATUS.PAGO },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalPagamentosPendentes() {
    const result = (await Pagamento.findAll({
      where: { status: [STATUS.PENDENTE, STATUS.ATRASADO] },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalPagamentosPendentesByUser(user_id: string) {
    const result = (await Pagamento.findAll({
      where: {
        user_id,
        status: [STATUS.PENDENTE, STATUS.ATRASADO],
      },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }
}
