import { AssinaturaRepository } from "../repository/AssinaturaRepository";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { HistoricoRepository } from "../repository/HistoricoRepository";
import { UserRepository } from "../repository/UserRepository";
import { PlanoAssinaturaRepository } from "../repository/PlanoAssinaturaRepository";
import { PERIODO, STATUS, STATUS_ASSINATURA } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";
import { Assinatura } from "../models/Assinatura";
import { PagamentoPendente } from "../models/PagamentoPendente";
import { Validators } from "../utils/Validators";
import {
  ValidationError,
  NotFoundError,
  InternalServerError,
  ConflictError,
} from "../utils/Errors";
import { Logger } from "../utils/Logger";

export class AssinaturaService {
  private assinaturaRepository: AssinaturaRepository;
  private pagamentoPendenteRepository: PagamentoPendenteRepository;
  private historicoRepository: HistoricoRepository;
  private userRepository: UserRepository;
  private planoRepository: PlanoAssinaturaRepository;

  constructor() {
    this.assinaturaRepository = new AssinaturaRepository();
    this.pagamentoPendenteRepository = new PagamentoPendenteRepository();
    this.historicoRepository = new HistoricoRepository();
    this.userRepository = new UserRepository();
    this.planoRepository = new PlanoAssinaturaRepository();
  }

  async createAssinatura(user_id: string, plano_id: string) {
    if (!user_id || !plano_id) {
      throw new ValidationError("Campos obrigatórios: user_id, plano_id");
    }

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }

    if (!Validators.isValidUUID(plano_id)) {
      throw new ValidationError("plano_id inválido");
    }

    try {
      await this.userRepository.getUserById(user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Usuário não encontrado");
      }
      throw error;
    }

    // Verificar se o plano existe
    let plano;
    try {
      plano = await this.planoRepository.getPlanoById(plano_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Plano de assinatura não encontrado");
      }
      throw error;
    }

    const assinaturasAtivas = await this.assinaturaRepository.getAssinaturasAtivasByUserId(user_id);
    if (assinaturasAtivas.length > 0) {
      throw new ConflictError(
        "Usuário já possui uma assinatura ativa. Cancele a assinatura atual antes de criar uma nova."
      );
    }

    // Verificar se já existe assinatura pendente
    const assinaturasPendentes = await this.assinaturaRepository.getAssinaturasByUserId(user_id);
    const pendente = assinaturasPendentes.find((a) => a.status === STATUS_ASSINATURA.PENDENTE);
    if (pendente) {
      throw new ConflictError("Usuário já possui uma assinatura pendente aguardando pagamento.");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        // Criar assinatura com status PENDENTE
        const data_inicio = new Date();
        const assinatura = await this.assinaturaRepository.createAssinatura(
          user_id,
          plano_id,
          data_inicio,
          transaction
        );

        // Criar pagamento pendente associado à assinatura
        const pagamentoPendente = await this.pagamentoPendenteRepository.createPagamentoPendente(
          user_id,
          plano.valor,
          new Date(), // Vencimento imediato para primeiro pagamento
          `Ativação de assinatura - Plano ${plano.nome}`,
          STATUS.PENDENTE,
          transaction,
          assinatura.id
        );

        Logger.info("Assinatura criada com pagamento pendente", {
          assinaturaId: assinatura.id,
          pagamentoPendenteId: pagamentoPendente.id,
          user_id,
          plano_id,
          valor: plano.valor,
        });

        return {
          assinatura,
          pagamentoPendente,
        };
      });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) throw error;
      Logger.error("Erro ao criar assinatura", {
        user_id,
        plano_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar a assinatura");
    }
  }

  async createAssinaturaWithTransaction(user_id: string, plano_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id é obrigatório e deve ser um UUID válido");
    }

    if (!Validators.isValidUUID(plano_id)) {
      throw new ValidationError("plano_id é obrigatório e deve ser um UUID válido");
    }

    try {
      await this.userRepository.getUserById(user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Usuário não encontrado");
      }
      throw error;
    }

    // Verificar se o plano existe
    try {
      await this.planoRepository.getPlanoById(plano_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Plano de assinatura não encontrado");
      }
      throw error;
    }

    const assinaturasAtivas = await this.assinaturaRepository.getAssinaturasAtivasByUserId(user_id);
    if (assinaturasAtivas.length > 0) {
      throw new ConflictError(
        "Usuário já possui uma assinatura ativa. Cancele a assinatura atual antes de criar uma nova."
      );
    }

    const assinaturasPendentes = await this.assinaturaRepository.getAssinaturasByUserId(user_id);
    const pendente = assinaturasPendentes.find((a) => a.status === STATUS_ASSINATURA.PENDENTE);
    if (pendente) {
      throw new ConflictError("Usuário já possui uma assinatura pendente aguardando pagamento.");
    }

    const data_inicio = new Date();

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.assinaturaRepository.createAssinatura(
          user_id,
          plano_id,
          data_inicio,
          transaction
        );
      });
    } catch (error) {
      Logger.error("Erro ao criar assinatura com transação", {
        user_id,
        plano_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar a assinatura");
    }
  }

  async getAllAssinaturas(limit: number = 50, offset: number = 0) {
    try {
      return await this.assinaturaRepository.getAllAssinaturas(limit, offset);
    } catch (error) {
      Logger.error("Erro ao buscar todas as assinaturas", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar as assinaturas");
    }
  }

  async getAssinaturaById(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      const assinatura = await this.assinaturaRepository.getAssinaturaById(id);
      if (!assinatura) {
        throw new NotFoundError("Assinatura não encontrada");
      }

      return assinatura;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error("Erro ao buscar assinatura por ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar a assinatura");
    }
  }

  async getAssinaturasByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.assinaturaRepository.getAssinaturasByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao buscar assinaturas do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar as assinaturas do usuário");
    }
  }

  async updateAssinatura(id: string, plano_id?: string, data_inicio?: Date) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (plano_id && !Validators.isValidUUID(plano_id)) {
      throw new ValidationError("plano_id deve ser um UUID válido");
    }

    if (plano_id) {
      try {
        await this.planoRepository.getPlanoById(plano_id);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new ValidationError("Plano de assinatura não encontrado");
        }
        throw error;
      }
    }

    if (data_inicio && !Validators.isValidDate(data_inicio)) {
      throw new ValidationError("data_inicio deve ser uma data válida");
    }

    try {
      return await this.assinaturaRepository.updateAssinatura(id, plano_id, data_inicio);
    } catch (error) {
      Logger.error("Erro ao atualizar assinatura", {
        id,
        plano_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar a assinatura");
    }
  }

  async deleteAssinatura(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.assinaturaRepository.deleteAssinatura(id);
    } catch (error) {
      Logger.error("Erro ao deletar assinatura", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar a assinatura");
    }
  }

  async deleteAssinaturasByUserId(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.assinaturaRepository.deleteAssinaturasByUserId(user_id);
    } catch (error) {
      Logger.error("Erro ao deletar assinaturas do usuário", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar as assinaturas do usuário");
    }
  }

  async deleteAssinaturasByUserIdWithTransaction(user_id: string) {
    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("User ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.assinaturaRepository.deleteAssinaturasByUserId(user_id, transaction);
      });
    } catch (error) {
      Logger.error("Erro ao deletar assinaturas do usuário com transação", {
        user_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar as assinaturas do usuário");
    }
  }

  /**
   * Calcula quantas pendências devem ser criadas baseado na periodicidade
   */
  private calcularNumeroPendencias(periodicidade: PERIODO): number {
    switch (periodicidade) {
      case PERIODO.MENSAL:
        return 12; // 12 meses
      case PERIODO.TRIMESTRAL:
        return 4; // 4 trimestres
      case PERIODO.SEMESTRAL:
        return 2; // 2 semestres
      case PERIODO.ANUAL:
        return 1; // 1 ano
      default:
        throw new ValidationError(`Periodicidade inválida: ${periodicidade}`);
    }
  }

  /**
   * Calcula quantos meses entre cada pagamento
   */
  private calcularMesesEntrePagamentos(periodicidade: PERIODO): number {
    switch (periodicidade) {
      case PERIODO.MENSAL:
        return 1;
      case PERIODO.TRIMESTRAL:
        return 3;
      case PERIODO.SEMESTRAL:
        return 6;
      case PERIODO.ANUAL:
        return 12;
      default:
        throw new ValidationError(`Periodicidade inválida: ${periodicidade}`);
    }
  }

  /**
   * Gera descrição amigável para a pendência
   */
  private gerarDescricaoPendencia(
    periodicidade: PERIODO,
    dataVencimento: Date,
    numero: number
  ): string {
    const mes = dataVencimento.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

    switch (periodicidade) {
      case PERIODO.MENSAL:
        return `Assinatura Mensal - ${mesCapitalizado}`;
      case PERIODO.TRIMESTRAL:
        return `Assinatura Trimestral - ${numero}º Trimestre (${mesCapitalizado})`;
      case PERIODO.SEMESTRAL:
        return `Assinatura Semestral - ${numero}º Semestre (${mesCapitalizado})`;
      case PERIODO.ANUAL:
        return `Assinatura Anual - ${mesCapitalizado}`;
      default:
        return `Assinatura - ${mesCapitalizado}`;
    }
  }

  /**
   * Cancela uma assinatura, limpa todas as pendências futuras e registra no histórico
   */
  async cancelarAssinatura(assinatura_id: string, motivo?: string) {
    if (!assinatura_id) {
      throw new ValidationError("ID da assinatura é obrigatório");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      // 1. Busca a assinatura
      const assinatura = (await Assinatura.findByPk(assinatura_id, {
        transaction,
      })) as any;

      if (!assinatura) {
        throw new NotFoundError("Assinatura");
      }

      if (assinatura.status === STATUS_ASSINATURA.CANCELADA) {
        throw new ConflictError("Assinatura já foi cancelada");
      }

      // 2. Busca pendências que serão canceladas (apenas desta assinatura)
      const pendenciasParaCancelar = await PagamentoPendente.findAll({
        where: {
          assinatura_id: assinatura_id,
          status: [STATUS.PENDENTE, STATUS.ATRASADO],
        },
        transaction,
      });

      const valorCancelado = pendenciasParaCancelar.reduce(
        (sum: number, p: any) => sum + parseFloat(p.valor as any),
        0
      );

      // 3. Atualiza todas as pendências para CANCELADO
      await Promise.all(
        pendenciasParaCancelar.map((p: any) =>
          p.update({ status: STATUS.CANCELADO }, { transaction })
        )
      );

      // 4. Atualiza o status da assinatura para CANCELADA
      assinatura.status = STATUS_ASSINATURA.CANCELADA;
      await assinatura.save({ transaction });

      return {
        message: "Assinatura cancelada com sucesso",
        resultado: {
          assinatura_id,
          status: STATUS_ASSINATURA.CANCELADA,
          pendencias_canceladas: pendenciasParaCancelar.length,
          valor_pendente_cancelado: valorCancelado,
        },
      };
    });
  }
}
