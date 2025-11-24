import { Historico } from "../models/Historico";
import { TIPO } from "../models/enums";
import { Op } from "sequelize";

export class HistoricoRepository {

  async createHistorico(
    user_id: string,
    tipo: TIPO,
    valor: number,
    data: Date,
    descricao: string
  ) {
    const historico = await Historico.create({
      user_id,
      tipo,
      valor,
      data,
      descricao
    });

    return historico;
  }

  async getAllHistorico() {
    return await Historico.findAll({
      order: [['data', 'DESC']]
    });
  }

  async getHistoricoById(id: string) {
    return await Historico.findByPk(id);
  }

  async getHistoricoByUserId(user_id: string) {
    return await Historico.findAll({
      where: { user_id },
      order: [['data', 'DESC']]
    });
  }

  async getHistoricoByTipo(tipo: TIPO) {
    return await Historico.findAll({
      where: { tipo },
      order: [['data', 'DESC']]
    });
  }

  async getHistoricoByPeriodo(data_inicio: Date, data_fim: Date) {
    return await Historico.findAll({
      where: {
        data: {
          [Op.between]: [data_inicio, data_fim]
        }
      },
      order: [['data', 'DESC']]
    });
  }

  async getHistoricoByUserIdAndPeriodo(user_id: string, data_inicio: Date, data_fim: Date) {
    return await Historico.findAll({
      where: {
        user_id,
        data: {
          [Op.between]: [data_inicio, data_fim]
        }
      },
      order: [['data', 'DESC']]
    });
  }

  async updateHistorico(
    id: string,
    tipo?: TIPO,
    valor?: number,
    data?: Date,
    descricao?: string
  ) {
    const historico = await Historico.findByPk(id);
    if (!historico) {
      throw new Error("Histórico não encontrado");
    }

    if (tipo) historico.tipo = tipo;
    if (valor !== undefined) historico.valor = valor;
    if (data) historico.data = data;
    if (descricao) historico.descricao = descricao;

    await historico.save();
    return historico;
  }

  async deleteHistorico(id: string) {
    const historico = await Historico.findByPk(id);
    if (!historico) {
      throw new Error("Histórico não encontrado");
    }

    await historico.destroy();
    return true;
  }
}

