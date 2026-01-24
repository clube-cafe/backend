import { Request, Response } from "express";
import { AssinaturaService } from "../services/AssinaturaService";

export class AssinaturaController {
  private assinaturaService: AssinaturaService;

  constructor() {
    this.assinaturaService = new AssinaturaService();
  }

  async createAssinatura(req: Request, res: Response) {
    try {
      const { user_id, valor, periodicidade, data_inicio } = req.body;
      const assinatura = await this.assinaturaService.createAssinatura(
        user_id,
        valor,
        periodicidade,
        new Date(data_inicio)
      );
      return res.status(201).json(assinatura);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllAssinaturas(req: Request, res: Response) {
    try {
      const assinaturas = await this.assinaturaService.getAllAssinaturas();
      return res.json(assinaturas);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter assinaturas", error: error.message });
    }
  }

  async getAssinaturaById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assinatura = await this.assinaturaService.getAssinaturaById(id);
      return res.json(assinatura);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getAssinaturasByUserId(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const assinaturas = await this.assinaturaService.getAssinaturasByUserId(user_id);
      return res.json(assinaturas);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async updateAssinatura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { valor, periodicidade, data_inicio } = req.body;
      const assinatura = await this.assinaturaService.updateAssinatura(
        id,
        valor,
        periodicidade,
        data_inicio ? new Date(data_inicio) : undefined
      );
      return res.json(assinatura);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deleteAssinatura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.assinaturaService.deleteAssinatura(id);
      return res.status(204).send();
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async createAssinaturaComPendencias(req: Request, res: Response) {
    try {
      const { user_id, valor, periodicidade, data_inicio, dia_vencimento } = req.body;
      const resultado = await this.assinaturaService.createAssinaturaComPendencias(
        user_id,
        valor,
        periodicidade,
        new Date(data_inicio),
        dia_vencimento
      );
      return res.status(201).json({
        message: "Assinatura criada com sucesso!",
        ...resultado,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async cancelarAssinatura(req: Request, res: Response) {
    try {
      const { assinatura_id } = req.params;
      const { motivo } = req.body;
      const resultado = await this.assinaturaService.cancelarAssinatura(assinatura_id, motivo);
      return res.status(200).json(resultado);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }
}
