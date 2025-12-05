import { AssinaturaRepository } from "../repository/AssinaturaRepository";
import { PERIODO } from "../models/enums";
import { TransactionHelper } from "../config/TransactionHelper";

export class AssinaturaService {
  private assinaturaRepository: AssinaturaRepository;

  constructor() {
    this.assinaturaRepository = new AssinaturaRepository();
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
}
