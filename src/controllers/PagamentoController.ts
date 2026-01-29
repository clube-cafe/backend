import { Request, Response } from "express";
import { PagamentoService } from "../services/PagamentoService";
import { PAGAMENTO_ENUM } from "../models/enums";
import { Logger } from "../utils/Logger";
import { Validators } from "../utils/Validators";

export class PagamentoController {
  private pagamentoService: PagamentoService;

  constructor() {
    this.pagamentoService = new PagamentoService();
  }

  async createPagamento(req: Request, res: Response) {
    try {
      const { user_id, valor, data_pagamento, forma_pagamento, observacao } = req.body;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para criar recursos para outros usuários" });
      }

      const pagamento = await this.pagamentoService.createPagamento(
        user_id,
        valor,
        new Date(data_pagamento),
        forma_pagamento,
        observacao
      );
      return res.status(201).json(pagamento);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllPagamentos(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100 || limit < 1) {
        return res.status(400).json({ message: "Limit deve estar entre 1 e 100" });
      }
      if (offset < 0) {
        return res.status(400).json({ message: "Offset deve ser maior ou igual a 0" });
      }

      const pagamentos = await this.pagamentoService.getAllPagamentos(limit, offset);
      return res.json(pagamentos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter pagamentos", error: error.message });
    }
  }

  async getPagamentoById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const pagamento = await this.pagamentoService.getPagamentoById(id);
      return res.json(pagamento);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getPagamentosByUserId(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      const pagamentos = await this.pagamentoService.getPagamentosByUserId(user_id);
      return res.json(pagamentos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
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
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosByDateRange(req: Request, res: Response) {
    try {
      const { data_inicio, data_fim } = req.query;

      if (!data_inicio || !data_fim) {
        return res.status(400).json({ message: "data_inicio e data_fim são obrigatórios" });
      }

      const dataInicio = new Date(data_inicio as string);
      const dataFim = new Date(data_fim as string);

      if (!Validators.isValidDate(dataInicio) || !Validators.isValidDate(dataFim)) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      const pagamentos = await this.pagamentoService.getPagamentosByDateRange(dataInicio, dataFim);
      return res.json(pagamentos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async updatePagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const { valor, data_pagamento, forma_pagamento, observacao } = req.body;

      const pagamento = await this.pagamentoService.getPagamentoById(id);
      if (req.user && pagamento.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para modificar este recurso" });
      }

      const updatedPagamento = await this.pagamentoService.updatePagamento(
        id,
        valor,
        data_pagamento ? new Date(data_pagamento) : undefined,
        forma_pagamento,
        observacao
      );
      return res.json(updatedPagamento);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deletePagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const pagamento = await this.pagamentoService.getPagamentoById(id);
      if (req.user && pagamento.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para deletar este recurso" });
      }

      await this.pagamentoService.deletePagamento(id);
      return res.status(204).send();
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getTotalPagamentos(req: Request, res: Response) {
    try {
      const total = await this.pagamentoService.getTotalPagamentos();
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getTotalPagamentosByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      const total = await this.pagamentoService.getTotalPagamentosByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async registrarPagamentoCompleto(req: Request, res: Response) {
    try {
      const { user_id, valor, data_pagamento, forma_pagamento, observacao, pagamento_pendente_id } =
        req.body;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para criar recursos para outros usuários" });
      }

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
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }
}
