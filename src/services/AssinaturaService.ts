import { AssinaturaRepository } from "../repository/AssinaturaRepository";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { HistoricoRepository } from "../repository/HistoricoRepository";
import { UserRepository } from "../repository/UserRepository";
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

  constructor() {
    this.assinaturaRepository = new AssinaturaRepository();
    this.pagamentoPendenteRepository = new PagamentoPendenteRepository();
    this.historicoRepository = new HistoricoRepository();
    this.userRepository = new UserRepository();
  }

  async createAssinatura(
    user_id: string,
    valor: number,
    periodicidade: PERIODO,
    data_inicio: Date
  ) {
    if (!user_id || !valor || !periodicidade || !data_inicio) {
      throw new ValidationError("Campos obrigatórios: user_id, valor, periodicidade, data_inicio");
    }

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }

    try {
      await this.userRepository.getUserById(user_id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError("Usuário não encontrado");
      }
      throw error;
    }

    const assinaturasAtivas = await this.assinaturaRepository.getAssinaturasAtivasByUserId(user_id);
    if (assinaturasAtivas.length > 0) {
      throw new ConflictError(
        "Usuário já possui uma assinatura ativa. Cancele a assinatura atual antes de criar uma nova."
      );
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError(
        "Valor deve ser um número positivo, finito e não superior a R$ 1.000.000"
      );
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new ValidationError("Periodicidade inválida: " + Object.values(PERIODO).join(", "));
    }

    if (!Validators.isValidDate(data_inicio)) {
      throw new ValidationError("Data de início inválida");
    }

    return await this.assinaturaRepository.createAssinatura(
      user_id,
      valor,
      periodicidade,
      data_inicio
    );
  }

  async createAssinaturaWithTransaction(
    user_id: string,
    valor: number,
    periodicidade: PERIODO,
    data_inicio: Date
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

    const assinaturasAtivas = await this.assinaturaRepository.getAssinaturasAtivasByUserId(user_id);
    if (assinaturasAtivas.length > 0) {
      throw new ConflictError(
        "Usuário já possui uma assinatura ativa. Cancele a assinatura atual antes de criar uma nova."
      );
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new ValidationError(
        `Periodicidade inválida. Opções: ${Object.values(PERIODO).join(", ")}`
      );
    }

    if (!Validators.isValidDate(data_inicio)) {
      throw new ValidationError("data_inicio deve ser uma data válida");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        return await this.assinaturaRepository.createAssinatura(
          user_id,
          valor,
          periodicidade,
          data_inicio,
          transaction
        );
      });
    } catch (error) {
      Logger.error("Erro ao criar assinatura com transação", {
        user_id,
        valor,
        periodicidade,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar a assinatura");
    }
  }

  async getAllAssinaturas() {
    try {
      return await this.assinaturaRepository.getAllAssinaturas();
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

  async updateAssinatura(id: string, valor?: number, periodicidade?: PERIODO, data_inicio?: Date) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    if (valor !== undefined && !Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (periodicidade && !Object.values(PERIODO).includes(periodicidade)) {
      throw new ValidationError(
        `Periodicidade inválida. Opções: ${Object.values(PERIODO).join(", ")}`
      );
    }

    if (data_inicio && !Validators.isValidDate(data_inicio)) {
      throw new ValidationError("data_inicio deve ser uma data válida");
    }

    try {
      return await this.assinaturaRepository.updateAssinatura(
        id,
        valor,
        periodicidade,
        data_inicio
      );
    } catch (error) {
      Logger.error("Erro ao atualizar assinatura", {
        id,
        valor,
        periodicidade,
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
   * Cria assinatura e gera automaticamente todos os pagamentos pendentes
   * baseados na periodicidade (MENSAL=12, TRIMESTRAL=4, SEMESTRAL=2, ANUAL=1)
   */
  async createAssinaturaComPendencias(
    user_id: string,
    valor: number,
    periodicidade: PERIODO,
    data_inicio: Date,
    dia_vencimento?: number
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

    const assinaturasAtivas = await this.assinaturaRepository.getAssinaturasAtivasByUserId(user_id);
    if (assinaturasAtivas.length > 0) {
      throw new ConflictError(
        "Usuário já possui uma assinatura ativa. Cancele a assinatura atual antes de criar uma nova."
      );
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError("Valor deve ser um número positivo e finito");
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new ValidationError(
        `Periodicidade inválida. Opções: ${Object.values(PERIODO).join(", ")}`
      );
    }

    if (!Validators.isValidDate(data_inicio)) {
      throw new ValidationError("data_inicio deve ser uma data válida");
    }

    const diaVencimento = dia_vencimento || 10;

    if (!Validators.isValidDay(diaVencimento) || diaVencimento > 31) {
      throw new ValidationError("Dia de vencimento deve estar entre 1 e 31");
    }

    try {
      return await TransactionHelper.executeTransaction(async (transaction) => {
        // 1. Cria a assinatura
        const assinatura = await this.assinaturaRepository.createAssinatura(
          user_id,
          valor,
          periodicidade,
          data_inicio,
          transaction
        );

        // 2. Calcula número de pendências baseado na periodicidade
        const numeroPendencias = this.calcularNumeroPendencias(periodicidade);
        const mesesEntrePagamentos = this.calcularMesesEntrePagamentos(periodicidade);

        // 3. Gera todas as pendências
        const pendencias = [];
        const dataBase = new Date(data_inicio);

        for (let i = 0; i < numeroPendencias; i++) {
          const dataVencimento = new Date(dataBase);
          dataVencimento.setMonth(dataBase.getMonth() + i * mesesEntrePagamentos);

          const ultimoDiaDoMes = new Date(
            dataVencimento.getFullYear(),
            dataVencimento.getMonth() + 1,
            0
          ).getDate();

          const diaAjustado = Math.min(diaVencimento, ultimoDiaDoMes);
          dataVencimento.setDate(diaAjustado);

          const dataInicioNormalizada = Validators.normalizeDate(data_inicio);
          const dataVencimentoNormalizada = Validators.normalizeDate(dataVencimento);

          if (i === 0 && dataVencimentoNormalizada < dataInicioNormalizada) {
            dataVencimento.setMonth(dataVencimento.getMonth() + mesesEntrePagamentos);
            const ultimoDiaProximoMes = new Date(
              dataVencimento.getFullYear(),
              dataVencimento.getMonth() + 1,
              0
            ).getDate();
            dataVencimento.setDate(Math.min(diaVencimento, ultimoDiaProximoMes));
          }

          // Define descrição baseada no período
          const descricao = this.gerarDescricaoPendencia(periodicidade, dataVencimento, i + 1);

          // Cria pendência associada à assinatura
          await this.pagamentoPendenteRepository.createPagamentoPendente(
            user_id,
            valor,
            dataVencimento,
            descricao,
            STATUS.PENDENTE,
            transaction,
            assinatura.id
          );

          pendencias.push({
            valor,
            data_vencimento: dataVencimento,
            descricao,
          });
        }

        Logger.info("Assinatura criada com pendências", {
          user_id,
          numeroAssinatura: assinatura.id,
          numeroPendencias: pendencias.length,
        });

        return {
          assinatura,
          pendencias_geradas: pendencias.length,
          pendencias,
        };
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      Logger.error("Erro ao criar assinatura com pendências", {
        user_id,
        valor,
        periodicidade,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível criar a assinatura com pendências");
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
      throw new Error("ID da assinatura é obrigatório");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      // 1. Busca a assinatura
      const assinatura = (await Assinatura.findByPk(assinatura_id, {
        transaction,
      })) as any;

      if (!assinatura) {
        throw new Error("Assinatura não encontrada");
      }

      if (assinatura.status === STATUS_ASSINATURA.CANCELADA) {
        throw new Error("Assinatura já foi cancelada");
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
