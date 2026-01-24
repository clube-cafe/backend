import { AssinaturaRepository } from "../repository/AssinaturaRepository";
import { PagamentoPendenteRepository } from "../repository/PagamentoPendenteRepository";
import { PERIODO, STATUS } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";

export class AssinaturaService {
  private assinaturaRepository: AssinaturaRepository;
  private pagamentoPendenteRepository: PagamentoPendenteRepository;

  constructor() {
    this.assinaturaRepository = new AssinaturaRepository();
    this.pagamentoPendenteRepository = new PagamentoPendenteRepository();
  }

  async createAssinatura(
    user_id: string,
    valor: number,
    periodicidade: PERIODO,
    data_inicio: Date
  ) {
    if (!user_id || !valor || !periodicidade || !data_inicio) {
      throw new Error("Campos obrigatórios: user_id, valor, periodicidade, data_inicio");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new Error("Periodicidade inválida");
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
    if (!user_id || !valor || !periodicidade || !data_inicio) {
      throw new Error("Campos obrigatórios: user_id, valor, periodicidade, data_inicio");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new Error("Periodicidade inválida");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.assinaturaRepository.createAssinatura(
        user_id,
        valor,
        periodicidade,
        data_inicio,
        transaction
      );
    });
  }

  async getAllAssinaturas() {
    return await this.assinaturaRepository.getAllAssinaturas();
  }

  async getAssinaturaById(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    const assinatura = await this.assinaturaRepository.getAssinaturaById(id);
    if (!assinatura) {
      throw new Error("Assinatura não encontrada");
    }

    return assinatura;
  }

  async getAssinaturasByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.assinaturaRepository.getAssinaturasByUserId(user_id);
  }

  async updateAssinatura(id: string, valor?: number, periodicidade?: PERIODO, data_inicio?: Date) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    if (valor !== undefined && valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (periodicidade && !Object.values(PERIODO).includes(periodicidade)) {
      throw new Error("Periodicidade inválida");
    }

    return await this.assinaturaRepository.updateAssinatura(id, valor, periodicidade, data_inicio);
  }

  async deleteAssinatura(id: string) {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    return await this.assinaturaRepository.deleteAssinatura(id);
  }

  async deleteAssinaturasByUserId(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await this.assinaturaRepository.deleteAssinaturasByUserId(user_id);
  }

  async deleteAssinaturasByUserIdWithTransaction(user_id: string) {
    if (!user_id) {
      throw new Error("User ID é obrigatório");
    }

    return await TransactionHelper.executeTransaction(async (transaction) => {
      return await this.assinaturaRepository.deleteAssinaturasByUserId(user_id, transaction);
    });
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
    // Validações
    if (!user_id || !valor || !periodicidade || !data_inicio) {
      throw new Error("Campos obrigatórios: user_id, valor, periodicidade, data_inicio");
    }

    if (valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new Error("Periodicidade inválida");
    }

    // Define dia de vencimento (padrão: 10)
    const diaVencimento = dia_vencimento || 10;

    if (diaVencimento < 1 || diaVencimento > 28) {
      throw new Error("Dia de vencimento deve estar entre 1 e 28");
    }

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
        // Calcula data de vencimento
        const dataVencimento = new Date(dataBase);
        dataVencimento.setMonth(dataBase.getMonth() + i * mesesEntrePagamentos);
        dataVencimento.setDate(diaVencimento);

        // Define descrição baseada no período
        const descricao = this.gerarDescricaoPendencia(periodicidade, dataVencimento, i + 1);

        // Cria pendência
        await this.pagamentoPendenteRepository.createPagamentoPendente(
          user_id,
          valor,
          dataVencimento,
          descricao,
          STATUS.PENDENTE,
          transaction
        );

        pendencias.push({
          valor,
          data_vencimento: dataVencimento,
          descricao,
        });
      }

      return {
        assinatura,
        pendencias_geradas: pendencias.length,
        pendencias,
      };
    });
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
        throw new Error("Periodicidade inválida");
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
        throw new Error("Periodicidade inválida");
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
    const mes = dataVencimento.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
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
}
