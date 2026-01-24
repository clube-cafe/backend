import { Request, Response } from "express";
import { PagamentoService } from "../services/PagamentoService";
import { PAGAMENTO_ENUM } from "../models/enums";

export class PagamentoController {
  private pagamentoService: PagamentoService;

  constructor() {
    this.pagamentoService = new PagamentoService();
  }

  async createPagamento(req: Request, res: Response) {
    try {
      const { user_id, valor, data_pagamento, forma_pagamento, observacao } = req.body;
      const pagamento = await this.pagamentoService.createPagamento(
        user_id,
        valor,
        new Date(data_pagamento),
        forma_pagamento,
        observacao
      );
      return res.status(201).json(pagamento);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllPagamentos(req: Request, res: Response) {
    try {
      const pagamentos = await this.pagamentoService.getAllPagamentos();
      return res.json(pagamentos);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao obter pagamentos", error: error.message });
    }
  }

  async getPagamentoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pagamento = await this.pagamentoService.getPagamentoById(id);
      return res.json(pagamento);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getPagamentosByUserId(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const pagamentos = await this.pagamentoService.getPagamentosByUserId(user_id);
      return res.json(pagamentos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosByForma(req: Request, res: Response) {
    try {
      const { forma_pagamento } = req.params;
      const pagamentos = await this.pagamentoService.getPagamentosByForma(
        forma_pagamento as PAGAMENTO_ENUM
      );
      return res.json(pagamentos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosByDateRange(req: Request, res: Response) {
    try {
      const { data_inicio, data_fim } = req.query;
      const pagamentos = await this.pagamentoService.getPagamentosByDateRange(
        new Date(data_inicio as string),
        new Date(data_fim as string)
      );
      return res.json(pagamentos);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async updatePagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { valor, data_pagamento, forma_pagamento, observacao } = req.body;
      const pagamento = await this.pagamentoService.updatePagamento(
        id,
        valor,
        data_pagamento ? new Date(data_pagamento) : undefined,
        forma_pagamento,
        observacao
      );
      return res.json(pagamento);
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deletePagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.pagamentoService.deletePagamento(id);
      return res.status(204).send();
    } catch (error: any) {
      console.error(error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getTotalPagamentos(req: Request, res: Response) {
    try {
      const total = await this.pagamentoService.getTotalPagamentos();
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getTotalPagamentosByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const total = await this.pagamentoService.getTotalPagamentosByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async registrarPagamentoCompleto(req: Request, res: Response) {
    try {
      const { user_id, valor, data_pagamento, forma_pagamento, observacao, pagamento_pendente_id } =
        req.body;
      const resultado = await this.pagamentoService.registrarPagamentoCompleto(
        user_id,
        valor,
        new Date(data_pagamento),
        forma_pagamento,
        observacao,
        pagamento_pendente_id
      );
      return res.status(201).json({
        message: "Pagamento registrado e histórico criado automaticamente",
        resultado,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
}
