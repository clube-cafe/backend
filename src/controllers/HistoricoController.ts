import { Request, Response } from "express";
import { HistoricoService } from "../services/HistoricoService";
import { TIPO } from "../models/enums";

export class HistoricoController {
  private historicoService: HistoricoService;

  constructor() {
    this.historicoService = new HistoricoService();
  }

  async createHistorico(req: Request, res: Response) {
    try {
      const { user_id, tipo, valor, data, descricao } = req.body;
      const historico = await this.historicoService.createHistorico(
        user_id,
        tipo,
        valor,
        new Date(data),
        descricao
      );
      return res.status(201).json(historico);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllHistoricos(req: Request, res: Response) {
    try {
      const historicos = await this.historicoService.getAllHistoricos();
      return res.json(historicos);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter históricos", error: error.message });
    }
  }

  async getHistoricoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const historico = await this.historicoService.getHistoricoById(id);
      return res.json(historico);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getHistoricosByUserId(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const historicos = await this.historicoService.getHistoricosByUserId(user_id);
      return res.json(historicos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getHistoricosByTipo(req: Request, res: Response) {
    try {
      const { tipo } = req.params;
      const historicos = await this.historicoService.getHistoricosByTipo(tipo as TIPO);
      return res.json(historicos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getHistoricosByPeriodo(req: Request, res: Response) {
    try {
      const { data_inicio, data_fim } = req.query;
      const historicos = await this.historicoService.getHistoricosByPeriodo(
        new Date(data_inicio as string),
        new Date(data_fim as string)
      );
      return res.json(historicos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getHistoricosByUserIdAndPeriodo(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const { data_inicio, data_fim } = req.query;
      const historicos = await this.historicoService.getHistoricosByUserIdAndPeriodo(
        user_id,
        new Date(data_inicio as string),
        new Date(data_fim as string)
      );
      return res.json(historicos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async updateHistorico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tipo, valor, data, descricao } = req.body;
      const historico = await this.historicoService.updateHistorico(
        id,
        tipo,
        valor,
        data ? new Date(data) : undefined,
        descricao
      );
      return res.json(historico);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deleteHistorico(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.historicoService.deleteHistorico(id);
      return res.status(204).send();
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getTotalEntradas(req: Request, res: Response) {
    try {
      const total = await this.historicoService.getTotalEntradas();
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getTotalSaidas(req: Request, res: Response) {
    try {
      const total = await this.historicoService.getTotalSaidas();
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getSaldoAtual(req: Request, res: Response) {
    try {
      const saldo = await this.historicoService.getSaldoAtual();
      return res.json({ saldo });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao calcular saldo", error: error.message });
    }
  }

  async getTotalEntradasByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const total = await this.historicoService.getTotalEntradasByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getTotalSaidasByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const total = await this.historicoService.getTotalSaidasByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getSaldoAtualByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const saldo = await this.historicoService.getSaldoAtualByUser(user_id);
      return res.json({ saldo });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
}
