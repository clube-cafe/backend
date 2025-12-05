import { Request, Response } from "express";
import { PagamentoPendenteService } from "../services/PagamentoPendenteService";
import { STATUS } from "../models/enums";

export class PagamentoPendenteController {
  private pagamentoPendenteService: PagamentoPendenteService;

  constructor() {
    this.pagamentoPendenteService = new PagamentoPendenteService();
  }

  async createPagamentoPendente(req: Request, res: Response) {
    try {
      const { user_id, valor, data_vencimento, descricao, status } = req.body;
      const pagamentoPendente = await this.pagamentoPendenteService.createPagamentoPendente(
        user_id,
        valor,
        new Date(data_vencimento),
        descricao,
        status
      );
      return res.status(201).json(pagamentoPendente);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllPagamentosPendentes(req: Request, res: Response) {
    try {
      const pagamentosPendentes = await this.pagamentoPendenteService.getAllPagamentosPendentes();
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao obter pagamentos pendentes", error: error.message });
    }
  }

  async getPagamentoPendenteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pagamentoPendente = await this.pagamentoPendenteService.getPagamentoPendenteById(id);
      return res.json(pagamentoPendente);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getPagamentosPendentesByUserId(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesByUserId(user_id);
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosPendentesByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesByStatus(status as STATUS);
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosPendentesVencidos(req: Request, res: Response) {
    try {
      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesVencidos();
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao obter pagamentos vencidos", error: error.message });
    }
  }

  async getPagamentosPendentesByPeriodo(req: Request, res: Response) {
    try {
      const { data_inicio, data_fim } = req.query;
      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesByPeriodo(
          new Date(data_inicio as string),
          new Date(data_fim as string)
        );
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async updatePagamentoPendente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { valor, data_vencimento, descricao, status } = req.body;
      const pagamentoPendente = await this.pagamentoPendenteService.updatePagamentoPendente(
        id,
        valor,
        data_vencimento ? new Date(data_vencimento) : undefined,
        descricao,
        status
      );
      return res.json(pagamentoPendente);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async updateStatusPagamentoPendente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const pagamentoPendente = await this.pagamentoPendenteService.updateStatusPagamentoPendente(
        id,
        status
      );
      return res.json(pagamentoPendente);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deletePagamentoPendente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.pagamentoPendenteService.deletePagamentoPendente(id);
      return res.status(204).send();
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getTotalPagamentosPendentes(req: Request, res: Response) {
    try {
      const total = await this.pagamentoPendenteService.getTotalPagamentosPendentes();
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getTotalPagamentosPendentesByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const total = await this.pagamentoPendenteService.getTotalPagamentosPendentesByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
}
