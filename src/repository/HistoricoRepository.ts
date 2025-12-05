import { Historico } from "../models/Historico";
import { TIPO } from "../models/enums";
import { Op, Transaction } from "sequelize";

export class HistoricoRepository {
  async createHistorico(
    user_id: string,
    tipo: TIPO,
    valor: number,
    data: Date,
    descricao: string,
    transaction?: Transaction
  ) {
    const historico = await Historico.create(
      {
        user_id,
        tipo,
        valor,
        data,
        descricao,
      },
      { transaction }
    );

    return historico;
  }

  async getAllHistorico() {
    return await Historico.findAll({
      order: [["data", "DESC"]],
    });
  }

  async getHistoricoById(id: string) {
    return await Historico.findByPk(id);
  }

  async getHistoricoByUserId(user_id: string) {
    return await Historico.findAll({
      where: { user_id },
      order: [["data", "DESC"]],
    });
  }

  async getHistoricoByTipo(tipo: TIPO) {
    return await Historico.findAll({
      where: { tipo },
      order: [["data", "DESC"]],
    });
  }

  async getHistoricoByPeriodo(data_inicio: Date, data_fim: Date) {
    return await Historico.findAll({
      where: {
        data: {
          [Op.between]: [data_inicio, data_fim],
        },
      },
      order: [["data", "DESC"]],
    });
  }

  async getHistoricoByUserIdAndPeriodo(user_id: string, data_inicio: Date, data_fim: Date) {
    return await Historico.findAll({
      where: {
        user_id,
        data: {
          [Op.between]: [data_inicio, data_fim],
        },
      },
      order: [["data", "DESC"]],
    });
  }

  async updateHistorico(
    id: string,
    tipo?: TIPO,
    valor?: number,
    data?: Date,
    descricao?: string,
    transaction?: Transaction
  ) {
    const historico = await Historico.findByPk(id, { transaction });
    if (!historico) {
      throw new Error("Histórico não encontrado");
    }

    if (tipo) historico.tipo = tipo;
    if (valor !== undefined) historico.valor = valor;
    if (data) historico.data = data;
    if (descricao) historico.descricao = descricao;

    await historico.save({ transaction });
    return historico;
  }

  async deleteHistorico(id: string, transaction?: Transaction) {
    const historico = await Historico.findByPk(id, { transaction });
    if (!historico) {
      throw new Error("Histórico não encontrado");
    }

    await historico.destroy({ transaction });
    return true;
  }

  async deleteHistoricosByUserId(user_id: string, transaction?: Transaction) {
    return await Historico.destroy({
      where: { user_id },
      transaction,
    });
  }

  async getTotalEntradas() {
    const result = (await Historico.findAll({
      where: { tipo: TIPO.ENTRADA },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalSaidas() {
    const result = (await Historico.findAll({
      where: { tipo: TIPO.SAIDA },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getSaldoAtual() {
    const entradas = await this.getTotalEntradas();
    const saidas = await this.getTotalSaidas();
    return entradas - saidas;
  }

  async getTotalEntradasByUser(user_id: string) {
    const result = (await Historico.findAll({
      where: { user_id, tipo: TIPO.ENTRADA },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getTotalSaidasByUser(user_id: string) {
    const result = (await Historico.findAll({
      where: { user_id, tipo: TIPO.SAIDA },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("valor")), "total"]],
      raw: true,
    })) as any[];

    return result[0]?.total || 0;
  }

  async getSaldoAtualByUser(user_id: string) {
    const entradas = await this.getTotalEntradasByUser(user_id);
    const saidas = await this.getTotalSaidasByUser(user_id);
    return entradas - saidas;
  }
}
