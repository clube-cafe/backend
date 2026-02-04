import { PlanoAssinaturaRepository } from "../repository/PlanoAssinaturaRepository";
import { PERIODO } from "../models/enums";
import { Validators } from "../utils/Validators";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/Errors";
import { Logger } from "../utils/Logger";

export class PlanoAssinaturaService {
  private planoRepository: PlanoAssinaturaRepository;

  constructor() {
    this.planoRepository = new PlanoAssinaturaRepository();
  }

  async createPlano(nome: string, descricao: string, valor: number, periodicidade: PERIODO) {
    if (!nome || !descricao || !valor || !periodicidade) {
      throw new ValidationError("Campos obrigatórios: nome, descricao, valor, periodicidade");
    }

    if (!Validators.isValidMoney(valor)) {
      throw new ValidationError(
        "Valor deve ser um número positivo, finito e não superior a R$ 1.000.000"
      );
    }

    if (!Object.values(PERIODO).includes(periodicidade)) {
      throw new ValidationError("Periodicidade inválida: " + Object.values(PERIODO).join(", "));
    }

    return await this.planoRepository.createPlano(nome, descricao, valor, periodicidade);
  }

  async getAllPlanos(limit: number = 50, offset: number = 0, apenasAtivos: boolean = true) {
    try {
      return await this.planoRepository.getAllPlanos(limit, offset, apenasAtivos);
    } catch (error) {
      Logger.error("Erro ao buscar todos os planos", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar os planos");
    }
  }

  async getPlanoById(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.planoRepository.getPlanoById(id);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      Logger.error("Erro ao buscar plano por ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível buscar o plano");
    }
  }

  async updatePlano(
    id: string,
    nome?: string,
    descricao?: string,
    valor?: number,
    periodicidade?: PERIODO,
    ativo?: boolean
  ) {
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

    try {
      return await this.planoRepository.updatePlano(
        id,
        nome,
        descricao,
        valor,
        periodicidade,
        ativo
      );
    } catch (error) {
      Logger.error("Erro ao atualizar plano", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível atualizar o plano");
    }
  }

  async deletePlano(id: string) {
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID é obrigatório e deve ser um UUID válido");
    }

    try {
      return await this.planoRepository.deletePlano(id);
    } catch (error) {
      Logger.error("Erro ao deletar plano", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerError("Não foi possível deletar o plano");
    }
  }
}
