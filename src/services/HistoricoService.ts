import { HistoricoRepository } from "../repository/HistoricoRepository";
import { TIPO } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";
import { Validators } from "../utils/Validators";
import { Logger } from "../utils/Logger";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/Errors";

export class HistoricoService {
  private historicoRepository: HistoricoRepository;

  constructor() {
    this.historicoRepository = new HistoricoRepository();
  }

  async createHistorico(user_id: string, tipo: TIPO, valor: number, data: Date, descricao: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    if (!Object.values(TIPO).includes(tipo)) {
      throw new ValidationError(`Tipo inválido. Opções: ${Object.values(TIPO).join(", ")}`);
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (!Validators.isValidDate(data)) {
      throw new ValidationError("data deve ser uma data válida");
    }

    if (!Validators.isValidString(descricao, 1, 255)) {
      throw new ValidationError("Descrição é obrigatória e deve ter até 255 caracteres");
    }

    try {
      const historico = await this.historicoRepository.createHistorico(
        user_id,
        tipo,
        valor,
        data,
        Validators.sanitizeString(descricao)
      );

      Logger.info("Histórico criado com sucesso", {
        historicoId: historico.id,
        user_id,
        tipo,
        valor,
      });

      return historico;
    } catch (error) {
      Logger.error("Erro ao criar histórico", {
        user_id,
        tipo,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar o histórico");
    }
  }

  async createHistoricoWithTransaction(
    user_id: string,
    tipo: TIPO,
    valor: number,
    data: Date,
    descricao: string
  ) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    if (!Object.values(TIPO).includes(tipo)) {
      throw new ValidationError(`Tipo inválido. Opções: ${Object.values(TIPO).join(", ")}`);
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (!Validators.isValidDate(data)) {
      throw new ValidationError("data deve ser uma data válida");
    }

    if (!Validators.isValidString(descricao, 1, 255)) {
      throw new ValidationError("Descrição é obrigatória e deve ter até 255 caracteres");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.historicoRepository.createHistorico(
          user_id,
          tipo,
          valor,
          data,
          Validators.sanitizeString(descricao),
          transaction
        );
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      Logger.error("Erro ao criar histórico com transação", {
        user_id,
        tipo,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar o histórico");
    }
  }

  async getAllHistoricos() {
    try {
      return await this.historicoRepository.getAllHistorico();
    } catch (error) {
      Logger.error("Erro ao buscar todos os históricos", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os históricos");
    }
  }

  async getHistoricoById(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      const historico = await this.historicoRepository.getHistoricoById(id);
      if (!historico) {
        throw new NotFoundError("Histórico não encontrado");
      }

      return historico;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error("Erro ao buscar histórico por ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar o histórico");
    }
  }

  async getHistoricosByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.historicoRepository.getHistoricoByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao buscar históricos do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os históricos do usuário");
    }
  }

  async getHistoricosByTipo(tipo: TIPO) {
    if (!Object.values(TIPO).includes(tipo)) {
      throw new ValidationError(`Tipo inválido. Opções: ${Object.values(TIPO).join(", ")}`);
    }

    try {
      return await this.historicoRepository.getHistoricoByTipo(tipo);
    } catch (error) {
      Logger.error("Erro ao buscar históricos por tipo", {
        tipo,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os históricos por tipo");
    }
  }

  async getHistoricosByPeriodo(data_inicio: Date, data_fim: Date) {
    if (!Validators.isValidDate(data_inicio) || !Validators.isValidDate(data_fim)) {
      throw new ValidationError("Data de início e fim são obrigatórias e devem ser datas válidas");
    }

    if (data_inicio > data_fim) {
      throw new ValidationError("Data de início não pode ser maior que data de fim");
    }

    try {
      return await this.historicoRepository.getHistoricoByPeriodo(data_inicio, data_fim);
    } catch (error) {
      Logger.error("Erro ao buscar históricos por período", {
        data_inicio,
        data_fim,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os históricos por período");
    }
  }

  async getHistoricosByUserIdAndPeriodo(user_id: string, data_inicio: Date, data_fim: Date) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    if (!Validators.isValidDate(data_inicio) || !Validators.isValidDate(data_fim)) {
      throw new ValidationError("Data de início e fim são obrigatórias e devem ser datas válidas");
    }

    if (data_inicio > data_fim) {
      throw new ValidationError("Data de início não pode ser maior que data de fim");
    }

    try {
      return await this.historicoRepository.getHistoricoByUserIdAndPeriodo(
        user_id,
        data_inicio,
        data_fim
      );
    } catch (error) {
      Logger.error("Erro ao buscar históricos do usuário por período", {
        user_id,
        data_inicio,
        data_fim,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os históricos do usuário por período");
    }
  }

  async updateHistorico(id: string, tipo?: TIPO, valor?: number, data?: Date, descricao?: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (valor !== undefined && !Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (tipo && !Object.values(TIPO).includes(tipo)) {
      throw new ValidationError(`Tipo inválido. Opções: ${Object.values(TIPO).join(", ")}`);
    }

    if (data && !Validators.isValidDate(data)) {
      throw new ValidationError("data deve ser uma data válida");
    }

    if (descricao && !Validators.isValidString(descricao, 1, 255)) {
      throw new ValidationError("Descrição deve ter entre 1 e 255 caracteres");
    }

    try {
      return await this.historicoRepository.updateHistorico(
        id,
        tipo,
        valor,
        data,
        descricao ? Validators.sanitizeString(descricao) : undefined
      );
    } catch (error) {
      Logger.error("Erro ao atualizar histórico", {
        id,
        tipo,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar o histórico");
    }
  }

  async deleteHistorico(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.historicoRepository.deleteHistorico(id);
    } catch (error) {
      Logger.error("Erro ao deletar histórico", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar o histórico");
    }
  }

  async deleteHistoricosByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.historicoRepository.deleteHistoricosByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao deletar históricos do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar os históricos do usuário");
    }
  }

  async deleteHistoricosByUserIdWithTransaction(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.historicoRepository.deleteHistoricosByUserId(user_id, transaction);
      });
    } catch (error) {
      Logger.error("Erro ao deletar históricos do usuário com transação", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar os históricos do usuário");
    }
  }

  async getTotalEntradas() {
    try {
      return await this.historicoRepository.getTotalEntradas();
    } catch (error) {
      Logger.error("Erro ao calcular total de entradas", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de entradas");
    }
  }

  async getTotalSaidas() {
    try {
      return await this.historicoRepository.getTotalSaidas();
    } catch (error) {
      Logger.error("Erro ao calcular total de saídas", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de saídas");
    }
  }

  async getSaldoAtual() {
    try {
      return await this.historicoRepository.getSaldoAtual();
    } catch (error) {
      Logger.error("Erro ao calcular saldo atual", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o saldo atual");
    }
  }

  async getTotalEntradasByUser(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.historicoRepository.getTotalEntradasByUser(user_id);
    } catch (error) {
      Logger.error("Erro ao calcular total de entradas do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de entradas do usuário");
    }
  }

  async getTotalSaidasByUser(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.historicoRepository.getTotalSaidasByUser(user_id);
    } catch (error) {
      Logger.error("Erro ao calcular total de saídas do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de saídas do usuário");
    }
  }

  async getSaldoAtualByUser(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.historicoRepository.getSaldoAtualByUser(user_id);
    } catch (error) {
      Logger.error("Erro ao calcular saldo atual do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o saldo atual do usuário");
    }
  }
}
