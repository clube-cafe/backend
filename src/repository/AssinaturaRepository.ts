import { Assinatura } from "../models/Assinatura";
import { PERIODO } from "../models/enums";

export class AssinaturaRepository {

  async createAssinatura(user_id: string, valor: number, periodicidade: PERIODO, data_inicio: Date) {
    const assinatura = await Assinatura.create({
      user_id,
      valor,
      periodicidade,
      data_inicio
    });

    return assinatura;
  }

  async getAllAssinaturas() {
    return await Assinatura.findAll();
  }

  async getAssinaturaById(id: string) {
    return await Assinatura.findByPk(id);
  }

  async getAssinaturasByUserId(user_id: string) {
    return await Assinatura.findAll({
      where: { user_id }
    });
  }

  async updateAssinatura(
    id: string, 
    valor?: number, 
    periodicidade?: PERIODO, 
    data_inicio?: Date
  ) {
    const assinatura = await Assinatura.findByPk(id);
    if (!assinatura) {
      throw new Error("Assinatura não encontrada");
    }

    if (valor !== undefined) assinatura.valor = valor;
    if (periodicidade) assinatura.periodicidade = periodicidade;
    if (data_inicio) assinatura.data_inicio = data_inicio;

    await assinatura.save();
    return assinatura;
  }

  async deleteAssinatura(id: string) {
    const assinatura = await Assinatura.findByPk(id);
    if (!assinatura) {
      throw new Error("Assinatura não encontrada");
    }

    await assinatura.destroy();
    return true;
  }
}

