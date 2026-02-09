import { PagamentoRepository } from "../repository/PagamentoRepository";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { HistoricoRepository } from "../repository/HistoricoRepository";
import { UserRepository } from "../repository/UserRepository";
import { AssinaturaRepository } from "../repository/AssinaturaRepository";
import { PAGAMENTO_ENUM, STATUS, STATUS_ASSINATURA, TIPO } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";
import { Validators } from "../utils/Validators";
import { Logger } from "../utils/Logger";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/Errors";

export class PagamentoService {
  private pagamentoRepository: PagamentoRepository;
  private pagamentoPendenteRepository: PagamentoPendenteRepository;
  private historicoRepository: HistoricoRepository;
  private userRepository: UserRepository;
  private assinaturaRepository: AssinaturaRepository;

  constructor() {
    this.pagamentoRepository = new PagamentoRepository();
    this.pagamentoPendenteRepository = new PagamentoPendenteRepository();
    this.historicoRepository = new HistoricoRepository();
    this.userRepository = new UserRepository();
    this.assinaturaRepository = new AssinaturaRepository();
  }

  async createPagamento(
    user_id: string,
    valor: number,
    data_pagamento: Date,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    try {
      await this.userRepository.getUserById(user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Usuário não encontrado");
      }
      throw error;
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError(
        "Valor deve ser um número positivo, finito e não superior a R$ 1.000.000"
      );
    }

    if (!Validators.isValidDate(data_pagamento)) {
      throw new ValidationError("data_pagamento deve ser uma data válida");
    }

    if (!Validators.isDateWithinReasonableRange(data_pagamento)) {
      throw new ValidationError("data_pagamento não pode estar mais de 10 anos no futuro");
    }

    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new ValidationError(
        `Forma de pagamento inválida. Opções: ${Object.values(PAGAMENTO_ENUM).join(", ")}`
      );
    }

    if (observacao && !Validators.isValidString(observacao, 0, 255)) {
      throw new ValidationError("Observação deve ter entre 0 e 255 caracteres");
    }

    try {
      const pagamento = await this.pagamentoRepository.createPagamento(
        user_id,
        valor,
        data_pagamento,
        forma_pagamento,
        observacao ? Validators.sanitizeString(observacao) : undefined
      );

      Logger.info("Pagamento criado com sucesso", {
        pagamentoId: pagamento.id,
        user_id,
        valor,
      });

      return pagamento;
    } catch (error) {
      Logger.error("Erro ao criar pagamento", {
        user_id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar o pagamento");
    }
  }

  async createPagamentoWithTransaction(
    user_id: string,
    valor: number,
    data_pagamento: Date,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    try {
      await this.userRepository.getUserById(user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Usuário não encontrado");
      }
      throw error;
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError(
        "Valor deve ser um número positivo, finito e não superior a R$ 1.000.000"
      );
    }

    if (!Validators.isValidDate(data_pagamento)) {
      throw new ValidationError("data_pagamento deve ser uma data válida");
    }

    if (!Validators.isDateWithinReasonableRange(data_pagamento)) {
      throw new ValidationError("data_pagamento não pode estar mais de 10 anos no futuro");
    }

    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new ValidationError(
        `Forma de pagamento inválida. Opções: ${Object.values(PAGAMENTO_ENUM).join(", ")}`
      );
    }

    if (observacao && !Validators.isValidString(observacao, 0, 255)) {
      throw new ValidationError("Observação deve ter entre 0 e 255 caracteres");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.pagamentoRepository.createPagamento(
          user_id,
          valor,
          data_pagamento,
          forma_pagamento,
          observacao ? Validators.sanitizeString(observacao) : undefined,
          transaction
        );
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      Logger.error("Erro ao criar pagamento com transação", {
        user_id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar o pagamento");
    }
  }

  async getAllPagamentos(limit: number = 50, offset: number = 0) {
    try {
      return await this.pagamentoRepository.getAllPagamentos(limit, offset);
    } catch (error) {
      Logger.error("Erro ao buscar todos os pagamentos", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos");
    }
  }

  async getPagamentoById(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      const pagamento = await this.pagamentoRepository.getPagamentoById(id);
      if (!pagamento) {
        throw new NotFoundError("Pagamento não encontrado");
      }

      return pagamento;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error("Erro ao buscar pagamento por ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar o pagamento");
    }
  }

  async getPagamentosByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoRepository.getPagamentosByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos do usuário");
    }
  }

  async getPagamentosByForma(forma_pagamento: PAGAMENTO_ENUM) {
    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new ValidationError(
        `Forma de pagamento inválida. Opções: ${Object.values(PAGAMENTO_ENUM).join(", ")}`
      );
    }

    try {
      return await this.pagamentoRepository.getPagamentosByFormaPagamento(forma_pagamento);
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos por forma", {
        forma_pagamento,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos por forma de pagamento");
    }
  }

  async getPagamentosByDateRange(data_inicio: Date, data_fim: Date) {
    if (!Validators.isValidDate(data_inicio) || !Validators.isValidDate(data_fim)) {
      throw new ValidationError("Data de início e fim são obrigatórias e devem ser datas válidas");
    }

    if (data_inicio > data_fim) {
      throw new ValidationError("Data de início não pode ser maior que data de fim");
    }

    try {
      return await this.pagamentoRepository.getPagamentosByPeriodo(data_inicio, data_fim);
    } catch (error) {
      Logger.error("Erro ao buscar pagamentos por período", {
        data_inicio,
        data_fim,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os pagamentos por período");
    }
  }

  async updatePagamento(
    id: string,
    valor?: number,
    data_pagamento?: Date,
    forma_pagamento?: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (valor !== undefined && !Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (data_pagamento && !Validators.isValidDate(data_pagamento)) {
      throw new ValidationError("data_pagamento deve ser uma data válida");
    }

    if (forma_pagamento && !Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new ValidationError(
        `Forma de pagamento inválida. Opções: ${Object.values(PAGAMENTO_ENUM).join(", ")}`
      );
    }

    if (observacao && !Validators.isValidString(observacao, 0, 255)) {
      throw new ValidationError("Observação deve ter entre 0 e 255 caracteres");
    }

    try {
      return await this.pagamentoRepository.updatePagamento(
        id,
        valor,
        data_pagamento,
        forma_pagamento,
        observacao ? Validators.sanitizeString(observacao) : undefined
      );
    } catch (error) {
      Logger.error("Erro ao atualizar pagamento", {
        id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar o pagamento");
    }
  }

  async deletePagamento(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoRepository.deletePagamento(id);
    } catch (error) {
      Logger.error("Erro ao deletar pagamento", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar o pagamento");
    }
  }

  async deletePagamentosByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoRepository.deletePagamentosByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao deletar pagamentos do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar os pagamentos do usuário");
    }
  }

  async deletePagamentosByUserIdWithTransaction(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.pagamentoRepository.deletePagamentosByUserId(user_id, transaction);
      });
    } catch (error) {
      Logger.error("Erro ao deletar pagamentos do usuário com transação", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar os pagamentos do usuário");
    }
  }

  async getTotalPagamentos() {
    try {
      return await this.pagamentoRepository.getTotalPagamentos();
    } catch (error) {
      Logger.error("Erro ao calcular total de pagamentos", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de pagamentos");
    }
  }

  async getTotalPagamentosByUser(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.pagamentoRepository.getTotalPagamentosByUser(user_id);
    } catch (error) {
      Logger.error("Erro ao calcular total de pagamentos do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível calcular o total de pagamentos do usuário");
    }
  }

  async registrarPagamentoCompleto(
    pagamento_pendente_id: string,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string
  ) {
    if (!Validators.isValidUUID(pagamento_pendente_id)) {
      throw new ValidationError("pagamento_pendente_id é obrigatório e deve ser um UUID válido");
    }

    // Buscar o pagamento pendente
    const pendente =
      await this.pagamentoPendenteRepository.getPagamentoPendenteById(pagamento_pendente_id);
    if (!pendente) {
      throw new NotFoundError("Pagamento pendente não encontrado");
    }

    if (pendente.status === STATUS.PAGO) {
      throw new ValidationError("Este pagamento já foi realizado");
    }

    if (pendente.status === STATUS.CANCELADO) {
      throw new ValidationError("Este pagamento foi cancelado");
    }

    const user_id = pendente.user_id;
    const valor = pendente.valor;
    const assinatura_id = pendente.assinatura_id;
    const data_pagamento = new Date(); // Data gerenciada pelo backend

    try {
      await this.userRepository.getUserById(user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Usuário não encontrado");
      }
      throw error;
    }

    if (!Object.values(PAGAMENTO_ENUM).includes(forma_pagamento)) {
      throw new ValidationError(
        `Forma de pagamento inválida. Opções: ${Object.values(PAGAMENTO_ENUM).join(", ")}`
      );
    }

    if (observacao && !Validators.isValidString(observacao, 0, 255)) {
      throw new ValidationError("Observação deve ter entre 0 e 255 caracteres");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        // Criar o pagamento
        const pagamento = await this.pagamentoRepository.createPagamento(
          user_id,
          valor,
          data_pagamento,
          forma_pagamento,
          observacao ? Validators.sanitizeString(observacao) : undefined,
          transaction
        );

        // Marcar pagamento pendente como PAGO
        await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(
          pagamento_pendente_id,
          STATUS.PAGO,
          transaction
        );

        // Registrar no histórico
        await this.historicoRepository.createHistorico(
          user_id,
          TIPO.ENTRADA,
          valor,
          data_pagamento,
          `Pagamento ${forma_pagamento} - ${pendente.descricao}`,
          transaction
        );

        // Se tem assinatura associada e está PENDENTE, ativar
        if (assinatura_id) {
          const assinatura = await this.assinaturaRepository.getAssinaturaById(
            assinatura_id,
            transaction
          );
          if (assinatura && assinatura.status === STATUS_ASSINATURA.PENDENTE) {
            await this.assinaturaRepository.updateStatusAssinatura(
              assinatura_id,
              STATUS_ASSINATURA.ATIVA,
              transaction
            );
            Logger.info("Assinatura ativada com sucesso", { assinatura_id });
          } else if (assinatura && assinatura.status === STATUS_ASSINATURA.ATIVA) {
            Logger.info("Assinatura já está ativa, pagamento recorrente processado", {
              assinatura_id,
              status: assinatura.status,
            });
          }
        }

        Logger.info("Pagamento registrado com sucesso", {
          pagamentoId: pagamento.id,
          pagamento_pendente_id,
          assinatura_id,
          user_id,
          valor,
          forma_pagamento,
        });

        return {
          pagamento,
          assinaturaAtivada: !!assinatura_id,
        };
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      if (error instanceof NotFoundError) throw error;
      Logger.error("Erro ao registrar pagamento", {
        pagamento_pendente_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível registrar o pagamento");
    }
  }
}
