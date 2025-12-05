import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { STATUS } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";

export class PagamentoPendenteService {
  private pagamentoPendenteRepository: PagamentoPendenteRepository;

  constructor() {
    this.pagamentoPendenteRepository = new PagamentoPendenteRepository();
  }

  async createPagamentoPendente(
    user_id: string,
    valor: number,
    data_vencimento: Date,
    descricao: string,
    status: STATUS = STATUS.PENDENTE
  ) {
    if (!user_id || !valor || !data_vencimento || !descricao) {
      throw new Error("Campos obrigatórios: user_id, valor, data_vencimento, descricao");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new Error("Status inválido");
    }

    return await this.pagamentoPendenteRepository.createPagamentoPendente(
      user_id,
      valor,
      data_vencimento,
      descricao,
      status
    );
  }

  async createPagamentoPendenteWithTransaction(
    user_id: string,
    valor: number,
    data_vencimento: Date,
    descricao: string,
    status: STATUS = STATUS.PENDENTE
  ) {
    if (!user_id || !valor || !data_vencimento || !descricao) {
      throw new Error("Campos obrigatórios: user_id, valor, data_vencimento, descricao");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new Error("Status inválido");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.pagamentoPendenteRepository.createPagamentoPendente(
        user_id,
        valor,
        data_vencimento,
        descricao,
        status,
        transaction
      );
    });
  }

  async getAllPagamentosPendentes() {
    return await this.pagamentoPendenteRepository.getAllPagamentosPendentes();
  }

  async getPagamentoPendenteById(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    const pagamentoPendente = await this.pagamentoPendenteRepository.getPagamentoPendenteById(id);
    if (!pagamentoPendente) {
      throw new Error("Pagamento pendente não encontrado");
    }

    return pagamentoPendente;
  }

  async getPagamentosPendentesByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.pagamentoPendenteRepository.getPagamentosPendentesByUserId(user_id);
  }

  async getPagamentosPendentesByStatus(status: STATUS) {
    if (!status) {
      throw new Error("Status é obrigatório");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new Error("Status inválido");
    }

    return await this.pagamentoPendenteRepository.getPagamentosPendentesByStatus(status);
  }

  async getPagamentosPendentesVencidos() {
    return await this.pagamentoPendenteRepository.getPagamentosVencidos();
  }

  async getPagamentosPendentesByPeriodo(data_inicio: Date, data_fim: Date) {
    if (!data_inicio || !data_fim) {
      throw new Error("Data de início e fim são obrigatórias");
    }

    if (data_inicio > data_fim) {
      throw new Error("Data de início não pode ser maior que data de fim");
    }

    return await this.pagamentoPendenteRepository.getPagamentosVencendo(data_inicio, data_fim);
  }

  async updatePagamentoPendente(
    id: string,
    valor?: number,
    data_vencimento?: Date,
    descricao?: string,
    status?: STATUS
  ) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    if (valor !== undefined && valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (status && !Object.values(STATUS).includes(status)) {
      throw new Error("Status inválido");
    }

    return await this.pagamentoPendenteRepository.updatePagamentoPendente(
      id,
      valor,
      data_vencimento,
      descricao,
      status
    );
  }

  async updateStatusPagamentoPendente(id: string, status: STATUS) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    if (!status) {
      throw new Error("Status é obrigatório");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new Error("Status inválido");
    }

    return await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(id, status);
  }

  async updateStatusPagamentoPendenteWithTransaction(id: string, status: STATUS) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    if (!status) {
      throw new Error("Status é obrigatório");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new Error("Status inválido");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(
        id,
        status,
        transaction
      );
    });
  }

  async deletePagamentoPendente(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    return await this.pagamentoPendenteRepository.deletePagamentoPendente(id);
  }

  async deletePagamentosPendentesByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.pagamentoPendenteRepository.deletePagamentosPendentesByUserId(user_id);
  }

  async deletePagamentosPendentesByUserIdWithTransaction(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.pagamentoPendenteRepository.deletePagamentosPendentesByUserId(
        user_id,
        transaction
      );
    });
  }

  async getTotalPagamentosPendentes() {
    return await this.pagamentoPendenteRepository.getTotalPagamentosPendentes();
  }

  async getTotalPagamentosPendentesByUser(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.pagamentoPendenteRepository.getTotalPagamentosPendentesByUser(user_id);
  }
}
