import { HistoricoRepository } from "../repository/HistoricoRepository";
import { TIPO } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";

export class HistoricoService {
  private historicoRepository: HistoricoRepository;

  constructor() {
    this.historicoRepository = new HistoricoRepository();
  }

  async createHistorico(user_id: string, tipo: TIPO, valor: number, data: Date, descricao: string) {
    if (!user_id || !tipo || !valor || !data || !descricao) {
      throw new Error("Campos obrigatórios: user_id, tipo, valor, data, descricao");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(TIPO).includes(tipo)) {
      throw new Error("Tipo inválido");
    }

    return await this.historicoRepository.createHistorico(user_id, tipo, valor, data, descricao);
  }

  async createHistoricoWithTransaction(
    user_id: string,
    tipo: TIPO,
    valor: number,
    data: Date,
    descricao: string
  ) {
    if (!user_id || !tipo || !valor || !data || !descricao) {
      throw new Error("Campos obrigatórios: user_id, tipo, valor, data, descricao");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(TIPO).includes(tipo)) {
      throw new Error("Tipo inválido");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.historicoRepository.createHistorico(
        user_id,
        tipo,
        valor,
        data,
        descricao,
        transaction
      );
    });
  }

  async getAllHistoricos() {
    return await this.historicoRepository.getAllHistorico();
  }

  async getHistoricoById(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    const historico = await this.historicoRepository.getHistoricoById(id);
    if (!historico) {
      throw new Error("Histórico não encontrado");
    }

    return historico;
  }

  async getHistoricosByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.historicoRepository.getHistoricoByUserId(user_id);
  }

  async getHistoricosByTipo(tipo: TIPO) {
    if (!tipo) {
      throw new Error("Tipo é obrigatório");
    }

    if (!Object.values(TIPO).includes(tipo)) {
      throw new Error("Tipo inválido");
    }

    return await this.historicoRepository.getHistoricoByTipo(tipo);
  }

  async getHistoricosByPeriodo(data_inicio: Date, data_fim: Date) {
    if (!data_inicio || !data_fim) {
      throw new Error("Data de início e fim são obrigatórias");
    }

    if (data_inicio > data_fim) {
      throw new Error("Data de início não pode ser maior que data de fim");
    }

    return await this.historicoRepository.getHistoricoByPeriodo(data_inicio, data_fim);
  }

  async getHistoricosByUserIdAndPeriodo(user_id: string, data_inicio: Date, data_fim: Date) {
    if (!user_id || !data_inicio || !data_fim) {
      throw new Error("User ID, data de início e fim são obrigatórios");
    }

    if (data_inicio > data_fim) {
      throw new Error("Data de início não pode ser maior que data de fim");
    }

    return await this.historicoRepository.getHistoricoByUserIdAndPeriodo(
      user_id,
      data_inicio,
      data_fim
    );
  }

  async updateHistorico(id: string, tipo?: TIPO, valor?: number, data?: Date, descricao?: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    if (valor !== undefined && valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (tipo && !Object.values(TIPO).includes(tipo)) {
      throw new Error("Tipo inválido");
    }

    return await this.historicoRepository.updateHistorico(id, tipo, valor, data, descricao);
  }

  async deleteHistorico(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    return await this.historicoRepository.deleteHistorico(id);
  }

  async deleteHistoricosByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.historicoRepository.deleteHistoricosByUserId(user_id);
  }

  async deleteHistoricosByUserIdWithTransaction(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.historicoRepository.deleteHistoricosByUserId(user_id, transaction);
    });
  }

  async getTotalEntradas() {
    return await this.historicoRepository.getTotalEntradas();
  }

  async getTotalSaidas() {
    return await this.historicoRepository.getTotalSaidas();
  }

  async getSaldoAtual() {
    return await this.historicoRepository.getSaldoAtual();
  }

  async getTotalEntradasByUser(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.historicoRepository.getTotalEntradasByUser(user_id);
  }

  async getTotalSaidasByUser(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.historicoRepository.getTotalSaidasByUser(user_id);
  }

  async getSaldoAtualByUser(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.historicoRepository.getSaldoAtualByUser(user_id);
  }
}
