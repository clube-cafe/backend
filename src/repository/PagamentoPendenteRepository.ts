import { PagamentoPendente } from "../models/PagamentoPendente";
import { STATUS } from "../models/enums";
import { Op } from "sequelize";

export class PagamentoPendenteRepository {

  async createPagamentoPendente(
    user_id: string,
    valor: number,
    data_vencimento: Date,
    descricao: string,
    status: STATUS = STATUS.PENDENTE
  ) {
    const pagamentoPendente = await PagamentoPendente.create({
      user_id,
      valor,
      data_vencimento,
      descricao,
      status
    });

    return pagamentoPendente;
  }

  async getAllPagamentosPendentes() {
    return await PagamentoPendente.findAll({
      order: [['data_vencimento', 'ASC']]
    });
  }

  async getPagamentoPendenteById(id: string) {
    return await PagamentoPendente.findByPk(id);
  }

  async getPagamentosPendentesByUserId(user_id: string) {
    return await PagamentoPendente.findAll({
      where: { user_id },
      order: [['data_vencimento', 'ASC']]
    });
  }

  async getPagamentosPendentesByStatus(status: STATUS) {
    return await PagamentoPendente.findAll({
      where: { status },
      order: [['data_vencimento', 'ASC']]
    });
  }

  async getPagamentosVencidos() {
    const hoje = new Date();
    return await PagamentoPendente.findAll({
      where: {
        data_vencimento: {
          [Op.lt]: hoje
        },
        status: {
          [Op.in]: [STATUS.PENDENTE, STATUS.ATRASADO]
        }
      },
      order: [['data_vencimento', 'ASC']]
    });
  }

  async getPagamentosVencendo(data_inicio: Date, data_fim: Date) {
    return await PagamentoPendente.findAll({
      where: {
        data_vencimento: {
          [Op.between]: [data_inicio, data_fim]
        },
        status: STATUS.PENDENTE
      },
      order: [['data_vencimento', 'ASC']]
    });
  }

  async updatePagamentoPendente(
    id: string,
    valor?: number,
    data_vencimento?: Date,
    descricao?: string,
    status?: STATUS
  ) {
    const pagamentoPendente = await PagamentoPendente.findByPk(id);
    if (!pagamentoPendente) {
      throw new Error("Pagamento pendente não encontrado");
    }

    if (valor !== undefined) pagamentoPendente.valor = valor;
    if (data_vencimento) pagamentoPendente.data_vencimento = data_vencimento;
    if (descricao) pagamentoPendente.descricao = descricao;
    if (status) pagamentoPendente.status = status;

    await pagamentoPendente.save();
    return pagamentoPendente;
  }

  async deletePagamentoPendente(id: string) {
    const pagamentoPendente = await PagamentoPendente.findByPk(id);
    if (!pagamentoPendente) {
      throw new Error("Pagamento pendente não encontrado");
    }

    await pagamentoPendente.destroy();
    return true;
  }
}

