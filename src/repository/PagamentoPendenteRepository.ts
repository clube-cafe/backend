import { PagamentoPendente } from "../models/PagamentoPendente";
import { STATUS } from "../models/enums";
import { Op, Transaction } from "sequelize";

export class PagamentoPendenteRepository {
  async createPagamentoPendente(
    user_id: string,
    valor: number,
    data_vencimento: Date,
    descricao: string,
    status: STATUS = STATUS.PENDENTE,
    transaction?: Transaction,
    assinatura_id?: string
  ) {
    const pagamentoPendente = await PagamentoPendente.create(
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

    return pagamentoPendente;
  }

  async getAllPagamentosPendentes() {
    return await PagamentoPendente.findAll({
      order: [["data_vencimento", "ASC"]],
    });
  }

  async getPagamentoPendenteById(id: string) {
    return await PagamentoPendente.findByPk(id);
  }

  async getPagamentosPendentesByUserId(user_id: string) {
    return await PagamentoPendente.findAll({
      where: { user_id },
      order: [["data_vencimento", "ASC"]],
    });
  }

  async getPagamentosPendentesByStatus(status: STATUS) {
    return await PagamentoPendente.findAll({
      where: { status },
      order: [["data_vencimento", "ASC"]],
    });
  }

  async getPagamentosVencidos() {
    const hoje = new Date();
    return await PagamentoPendente.findAll({
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
    return await PagamentoPendente.findAll({
      where: {
        data_vencimento: {
          [Op.between]: [data_inicio, data_fim],
        },
        status: STATUS.PENDENTE,
      },
      order: [["data_vencimento", "ASC"]],
    });
  }

  async updatePagamentoPendente(
    id: string,
    valor?: number,
    data_vencimento?: Date,
    descricao?: string,
    status?: STATUS,
    transaction?: Transaction
  ) {
    const pagamentoPendente = await PagamentoPendente.findByPk(id, { transaction });
    if (!pagamentoPendente) {
      throw new Error("Pagamento pendente não encontrado");
    }

    if (valor !== undefined) pagamentoPendente.valor = valor;
    if (data_vencimento) pagamentoPendente.data_vencimento = data_vencimento;
    if (descricao) pagamentoPendente.descricao = descricao;
    if (status) pagamentoPendente.status = status;

    await pagamentoPendente.save({ transaction });
    return pagamentoPendente;
  }

  async deletePagamentoPendente(id: string, transaction?: Transaction) {
    const pagamentoPendente = await PagamentoPendente.findByPk(id, { transaction });
    if (!pagamentoPendente) {
      throw new Error("Pagamento pendente não encontrado");
    }

    await pagamentoPendente.destroy({ transaction });
    return true;
  }

  async deletePagamentosPendentesByUserId(user_id: string, transaction?: Transaction) {
    return await PagamentoPendente.destroy({
      where: { user_id },
      transaction,
    });
  }

  async updateStatusPagamentoPendente(id: string, status: STATUS, transaction?: Transaction) {
    const pagamentoPendente = await PagamentoPendente.findByPk(id, { transaction });
    if (!pagamentoPendente) {
      throw new Error("Pagamento pendente não encontrado");
    }

    pagamentoPendente.status = status;
    await pagamentoPendente.save({ transaction });
    return pagamentoPendente;
  }

  async getTotalPagamentosPendentes() {
    const result = (await PagamentoPendente.findAll({
      where: { status: [STATUS.PENDENTE, STATUS.ATRASADO] },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalPagamentosPendentesByUser(user_id: string) {
    const result = (await PagamentoPendente.findAll({
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
