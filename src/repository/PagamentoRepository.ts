import { Pagamento } from "../models/Pagamento";
import { PAGAMENTO_ENUM } from "../models/enums";
import { Op } from "sequelize";

export class PagamentoRepository {

  async createPagamento(
    user_id: string, 
    valor: number, 
    data_pagamento: Date, 
    forma_pagamento: PAGAMENTO_ENUM, 
    observacao?: string
  ) {
    const pagamento = await Pagamento.create({
      user_id,
      valor,
      data_pagamento,
      forma_pagamento,
      observacao: observacao || null
    });

    return pagamento;
  }

  async getAllPagamentos() {
    return await Pagamento.findAll({
      order: [['data_pagamento', 'DESC']]
    });
  }

  async getPagamentoById(id: string) {
    return await Pagamento.findByPk(id);
  }

  async getPagamentosByUserId(user_id: string) {
    return await Pagamento.findAll({
      where: { user_id },
      order: [['data_pagamento', 'DESC']]
    });
  }

  async getPagamentosByFormaPagamento(forma_pagamento: PAGAMENTO_ENUM) {
    return await Pagamento.findAll({
      where: { forma_pagamento },
      order: [['data_pagamento', 'DESC']]
    });
  }

  async getPagamentosByPeriodo(data_inicio: Date, data_fim: Date) {
    return await Pagamento.findAll({
      where: {
        data_pagamento: {
          [Op.between]: [data_inicio, data_fim]
        }
      },
      order: [['data_pagamento', 'DESC']]
    });
  }

  async updatePagamento(
    id: string,
    valor?: number,
    data_pagamento?: Date,
    forma_pagamento?: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    const pagamento = await Pagamento.findByPk(id);
    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    if (valor !== undefined) pagamento.valor = valor;
    if (data_pagamento) pagamento.data_pagamento = data_pagamento;
    if (forma_pagamento) pagamento.forma_pagamento = forma_pagamento;
    if (observacao !== undefined) pagamento.observacao = observacao;

    await pagamento.save();
    return pagamento;
  }

  async deletePagamento(id: string) {
    const pagamento = await Pagamento.findByPk(id);
    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    await pagamento.destroy();
    return true;
  }
}

