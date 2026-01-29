import { PagamentoRepository } from "../repository/PagamentoRepository";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { HistoricoRepository } from "../repository/HistoricoRepository";
import { UserRepository } from "../repository/UserRepository";
import { PAGAMENTO_ENUM, STATUS, TIPO } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";
import { Validators } from "../utils/Validators";
import { Logger } from "../utils/Logger";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/Errors";

export class PagamentoService {
  private pagamentoRepository: PagamentoRepository;
  private pagamentoPendenteRepository: PagamentoPendenteRepository;
  private historicoRepository: HistoricoRepository;
  private userRepository: UserRepository;

  constructor() {
    this.pagamentoRepository = new PagamentoRepository();
    this.pagamentoPendenteRepository = new PagamentoPendenteRepository();
    this.historicoRepository = new HistoricoRepository();
    this.userRepository = new UserRepository();
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
    user_id: string,
    valor: number,
    data_pagamento: Date,
    forma_pagamento: PAGAMENTO_ENUM,
    observacao?: string,
    pagamento_pendente_id?: string
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

    if (pagamento_pendente_id && !Validators.isValidUUID(pagamento_pendente_id)) {
      throw new ValidationError("pagamento_pendente_id deve ser um UUID válido");
    }

    if (observacao && !Validators.isValidString(observacao, 0, 255)) {
      throw new ValidationError("Observação deve ter entre 0 e 255 caracteres");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        const pagamento = await this.pagamentoRepository.createPagamento(
          user_id,
          valor,
          data_pagamento,
          forma_pagamento,
          observacao ? Validators.sanitizeString(observacao) : undefined,
          transaction
        );

        let descricaoPendente = "Pagamento Manual";

        if (pagamento_pendente_id) {
          const pendente =
            await this.pagamentoPendenteRepository.getPagamentoPendenteById(pagamento_pendente_id);

          if (!pendente) {
            throw new ValidationError("Pagamento pendente não encontrado");
          }

          if (pendente.user_id !== user_id) {
            throw new ValidationError("Pagamento pendente não pertence ao usuário informado");
          }

          if (pendente.status === STATUS.PAGO || pendente.status === STATUS.CANCELADO) {
            throw new ValidationError(
              `Pagamento pendente já está ${pendente.status === STATUS.PAGO ? "pago" : "cancelado"}`
            );
          }

          if (pendente.valor !== valor) {
            throw new ValidationError(
              `Valor do pagamento (${valor}) não corresponde ao valor do pendente (${pendente.valor})`
            );
          }

          descricaoPendente = pendente.descricao;
          await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(
            pagamento_pendente_id,
            STATUS.PAGO,
            transaction
          );
        } else {
          const pendentes =
            await this.pagamentoPendenteRepository.getPagamentosPendentesByUserId(user_id);
          const pendentesPendentes = pendentes.filter(
            (p) =>
              p.valor === valor && (p.status === STATUS.PENDENTE || p.status === STATUS.ATRASADO)
          );

          if (pendentesPendentes.length === 0) {
            Logger.warn("Nenhum pagamento pendente encontrado para associar ao pagamento", {
              user_id,
              valor,
            });
          } else if (pendentesPendentes.length > 1) {
            pendentesPendentes.sort((a, b) => {
              const dataA = new Date(a.data_vencimento).getTime();
              const dataB = new Date(b.data_vencimento).getTime();
              return dataA - dataB;
            });
            Logger.warn("Múltiplos pagamentos pendentes encontrados, usando o mais antigo", {
              user_id,
              valor,
              total: pendentesPendentes.length,
            });
          }

          const pendente = pendentesPendentes[0];
          if (pendente) {
            const pendenteAtualizado =
              await this.pagamentoPendenteRepository.getPagamentoPendenteById(
                pendente.id,
                transaction
              );

            if (!pendenteAtualizado) {
              throw new ValidationError("Pagamento pendente não encontrado");
            }

            if (
              pendenteAtualizado.status === STATUS.PAGO ||
              pendenteAtualizado.status === STATUS.CANCELADO
            ) {
              throw new ValidationError(
                `Pagamento pendente já está ${pendenteAtualizado.status === STATUS.PAGO ? "pago" : "cancelado"}`
              );
            }

            if (pendenteAtualizado.valor !== valor) {
              throw new ValidationError(
                `Valor do pagamento (${valor}) não corresponde ao valor do pendente (${pendenteAtualizado.valor})`
              );
            }

            descricaoPendente = pendenteAtualizado.descricao;
            await this.pagamentoPendenteRepository.updateStatusPagamentoPendente(
              pendente.id,
              STATUS.PAGO,
              transaction
            );
          }
        }

        await this.historicoRepository.createHistorico(
          user_id,
          TIPO.ENTRADA,
          valor,
          data_pagamento,
          `Pagamento ${forma_pagamento} - ${descricaoPendente}`,
          transaction
        );

        Logger.info("Pagamento completo registrado com sucesso", {
          pagamentoId: pagamento.id,
          user_id,
          valor,
          forma_pagamento,
        });

        return pagamento;
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      Logger.error("Erro ao registrar pagamento completo", {
        user_id,
        valor,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível registrar o pagamento completo");
    }
  }
}
