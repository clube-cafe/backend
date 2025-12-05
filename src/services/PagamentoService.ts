import { PagamentoRepository } from "../repository/PagamentoRepository";
import { PAGAMENTO_ENUM } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";

export class PagamentoService {
  private pagamentoRepository: PagamentoRepository;

  constructor() {
    this.pagamentoRepository = new PagamentoRepository();
  }

  async createPagamento(
    user_id: string,
    valor: number,
    data_pagamento: Date,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!user_id || !valor || !data_pagamento || !forma_pagamento) {
      throw new Error("Campos obrigatórios: user_id, valor, data_pagamento, forma_pagamento");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new Error("Forma de pagamento inválida");
    }

    return await this.pagamentoRepository.createPagamento(
      user_id,
      valor,
      data_pagamento,
      forma_pagamento,
      observacao
    );
  }

  async createPagamentoWithTransaction(
    user_id: string,
    valor: number,
    data_pagamento: Date,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!user_id || !valor || !data_pagamento || !forma_pagamento) {
      throw new Error("Campos obrigatórios: user_id, valor, data_pagamento, forma_pagamento");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new Error("Forma de pagamento inválida");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.pagamentoRepository.createPagamento(
        user_id,
        valor,
        data_pagamento,
        forma_pagamento,
        observacao,
        transaction
      );
    });
  }

  async getAllPagamentos() {
    return await this.pagamentoRepository.getAllPagamentos();
  }

  async getPagamentoById(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    const pagamento = await this.pagamentoRepository.getPagamentoById(id);
    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    return pagamento;
  }

  async getPagamentosByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.pagamentoRepository.getPagamentosByUserId(user_id);
  }

  async getPagamentosByForma(forma_pagamento: PAGAMENTO_ENUM) {
    if (!forma_pagamento) {
      throw new Error("Forma de pagamento é obrigatória");
    }

    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new Error("Forma de pagamento inválida");
    }

    return await this.pagamentoRepository.getPagamentosByFormaPagamento(forma_pagamento);
  }

  async getPagamentosByDateRange(data_inicio: Date, data_fim: Date) {
    if (!data_inicio || !data_fim) {
      throw new Error("Data de início e fim são obrigatórias");
    }

    if (data_inicio > data_fim) {
      throw new Error("Data de início não pode ser maior que data de fim");
    }

    return await this.pagamentoRepository.getPagamentosByPeriodo(data_inicio, data_fim);
  }

  async updatePagamento(
    id: string,
    valor?: number,
    data_pagamento?: Date,
    forma_pagamento?: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    if (valor !== undefined && valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (forma_pagamento && !Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new Error("Forma de pagamento inválida");
    }

    return await this.pagamentoRepository.updatePagamento(
      id,
      valor,
      data_pagamento,
      forma_pagamento,
      observacao
    );
  }

  async deletePagamento(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    return await this.pagamentoRepository.deletePagamento(id);
  }

  async deletePagamentosByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.pagamentoRepository.deletePagamentosByUserId(user_id);
  }

  async deletePagamentosByUserIdWithTransaction(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.pagamentoRepository.deletePagamentosByUserId(user_id, transaction);
    });
  }

  async getTotalPagamentos() {
    return await this.pagamentoRepository.getTotalPagamentos();
  }

  async getTotalPagamentosByUser(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.pagamentoRepository.getTotalPagamentosByUser(user_id);
  }
}
