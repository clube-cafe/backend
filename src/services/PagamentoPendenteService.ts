import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { STATUS } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";
import { Validators } from "../utils/Validators";
import { Logger } from "../utils/Logger";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/Errors";

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
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (!Validators.isValidDate(data_vencimento)) {
      throw new ValidationError("data_vencimento deve ser uma data válida");
    }

    if (!Validators.isValidString(descricao, 1, 255)) {
      throw new ValidationError("Descrição é obrigatória e deve ter até 255 caracteres");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new ValidationError(`Status inválido. Opções: ${Object.values(STATUS).join(", ")}`);
    }

    try {
      const pagamentoPendente = await this.pagamentoPendenteRepository.createPagamentoPendente(
        user_id,
        valor,
        data_vencimento,
        Validators.sanitizeString(descricao),
        status
      );

      Logger.info("Pagamento pendente criado com sucesso", {
        pagamentoPendenteId: pagamentoPendente.id,
        user_id,
        valor,
        status,
      });

      return pagamentoPendente;
    } catch (error) {
      Logger.error("Erro ao criar pagamento pendente", {
        user_id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar o pagamento pendente");
    }
  }

  async createPagamentoPendenteWithTransaction(
    user_id: string,
    valor: number,
    data_vencimento: Date,
    descricao: string,
    status: STATUS = STATUS.PENDENTE
  ) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (!Validators.isValidDate(data_vencimento)) {
      throw new ValidationError("data_vencimento deve ser uma data válida");
    }

    if (!Validators.isValidString(descricao, 1, 255)) {
      throw new ValidationError("Descrição é obrigatória e deve ter até 255 caracteres");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new ValidationError(`Status inválido. Opções: ${Object.values(STATUS).join(", ")}`);
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.pagamentoPendenteRepository.createPagamentoPendente(
          user_id,
          valor,
          data_vencimento,
          Validators.sanitizeString(descricao),
          status,
          transaction
        );
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      Logger.error("Erro ao criar pagamento pendente com transação", {
        user_id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar o pagamento pendente");
    }
  }

  async getAllPagamentosPendentes() {
    try {
      return await this.pagamentoPendenteRepository.getAllPagamentosPendentes();
    } catch (error) {
      Logger.error("Erro ao buscar todos os pagamentos pendentes", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos pendentes");
    }
  }

  async getPagamentoPendenteById(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      const pagamentoPendente = await this.pagamentoPendenteRepository.getPagamentoPendenteById(id);

      if (!pagamentoPendente) {
        throw new NotFoundError("Pagamento pendente não encontrado");
      }

      return pagamentoPendente;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error("Erro ao buscar pagamento pendente por ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar o pagamento pendente");
    }
  }

  async getPagamentosPendentesByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoPendenteRepository.getPagamentosPendentesByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos pendentes do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos pendentes do usuário");
    }
  }

  async getPagamentosPendentesByStatus(status: STATUS) {
    if (!Object.values(STATUS).includes(status)) {
      throw new ValidationError(`Status inválido. Opções: ${Object.values(STATUS).join(", ")}`);
    }

    try {
      return await this.pagamentoPendenteRepository.getPagamentosPendentesByStatus(status);
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos pendentes por status", {
        status,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos pendentes por status");
    }
  }

  async getPagamentosPendentesVencidos() {
    try {
      return await this.pagamentoPendenteRepository.getPagamentosVencidos();
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos pendentes vencidos", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos pendentes vencidos");
    }
  }

  async getPagamentosPendentesByPeriodo(data_inicio: Date, data_fim: Date) {
    if (!Validators.isValidDate(data_inicio) || !Validators.isValidDate(data_fim)) {
      throw new ValidationError("Data de início e fim são obrigatórias e devem ser datas válidas");
    }

    if (data_inicio > data_fim) {
      throw new ValidationError("Data de início não pode ser maior que data de fim");
    }

    try {
      return await this.pagamentoPendenteRepository.getPagamentosVencendo(data_inicio, data_fim);
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos pendentes por período", {
        data_inicio,
        data_fim,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos pendentes por período");
    }
  }

  async updatePagamentoPendente(
    id: string,
    valor?: number,
    data_vencimento?: Date,
    descricao?: string,
    status?: STATUS
  ) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (valor !== undefined && !Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (data_vencimento && !Validators.isValidDate(data_vencimento)) {
      throw new ValidationError("data_vencimento deve ser uma data válida");
    }

    if (descricao && !Validators.isValidString(descricao, 1, 255)) {
      throw new ValidationError("Descrição deve ter entre 1 e 255 caracteres");
    }

    if (status && !Object.values(STATUS).includes(status)) {
      throw new ValidationError(`Status inválido. Opções: ${Object.values(STATUS).join(", ")}`);
    }

    try {
      return await this.pagamentoPendenteRepository.updatePagamentoPendente(
        id,
        valor,
        data_vencimento,
        descricao ? Validators.sanitizeString(descricao) : undefined,
        status
      );
    } catch (error) {
      Logger.error("Erro ao atualizar pagamento pendente", {
        id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar o pagamento pendente");
    }
  }

  async updateStatusPagamentoPendente(id: string, status: STATUS) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new ValidationError(`Status inválido. Opções: ${Object.values(STATUS).join(", ")}`);
    }

    try {
      return await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(id, status);
    } catch (error) {
      Logger.error("Erro ao atualizar status do pagamento pendente", {
        id,
        status,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar o status do pagamento pendente");
    }
  }

  async updateStatusPagamentoPendenteWithTransaction(id: string, status: STATUS) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (!Object.values(STATUS).includes(status)) {
      throw new ValidationError(`Status inválido. Opções: ${Object.values(STATUS).join(", ")}`);
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(
          id,
          status,
          transaction
        );
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      Logger.error("Erro ao atualizar status do pagamento pendente com transação", {
        id,
        status,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar o status do pagamento pendente");
    }
  }

  async deletePagamentoPendente(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoPendenteRepository.deletePagamentoPendente(id);
    } catch (error) {
      Logger.error("Erro ao deletar pagamento pendente", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar o pagamento pendente");
    }
  }

  async deletePagamentosPendentesByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoPendenteRepository.deletePagamentosPendentesByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao deletar pagamentos pendentes do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar os pagamentos pendentes do usuário");
    }
  }

  async deletePagamentosPendentesByUserIdWithTransaction(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.pagamentoPendenteRepository.deletePagamentosPendentesByUserId(
          user_id,
          transaction
        );
      });
    } catch (error) {
      Logger.error("Erro ao deletar pagamentos pendentes do usuário com transação", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar os pagamentos pendentes do usuário");
    }
  }

  async getTotalPagamentosPendentes() {
    try {
      return await this.pagamentoPendenteRepository.getTotalPagamentosPendentes();
    } catch (error) {
      Logger.error("Erro ao calcular total de pagamentos pendentes", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de pagamentos pendentes");
    }
  }

  async getTotalPagamentosPendentesByUser(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoPendenteRepository.getTotalPagamentosPendentesByUser(user_id);
    } catch (error) {
      Logger.error("Erro ao calcular total de pagamentos pendentes do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError(
        "Não foi possível calcular o total de pagamentos pendentes do usuário"
      );
    }
  }
}
