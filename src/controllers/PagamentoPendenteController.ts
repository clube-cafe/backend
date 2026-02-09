import { Request, Response } from "express";
import { PagamentoPendenteService } from "../services/PagamentoPendenteService";
import { STATUS } from "../models/enums";
import { Logger } from "../utils/Logger";
import { Validators } from "../utils/Validators";

export class PagamentoPendenteController {
  private pagamentoPendenteService: PagamentoPendenteService;

  constructor() {
    this.pagamentoPendenteService = new PagamentoPendenteService();
  }

  async createPagamentoPendente(req: Request, res: Response) {
    try {
      const { user_id, valor, data_vencimento, descricao, status } = req.body;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para criar recursos para outros usuários" });
      }

      const pagamentoPendente = await this.pagamentoPendenteService.createPagamentoPendente(
        user_id,
        valor,
        new Date(data_vencimento),
        descricao,
        status
      );
      return res.status(201).json(pagamentoPendente);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllPagamentosPendentes(req: Request, res: Response) {
    try {
      // Restringir acesso apenas para admin
      if (!req.user || req.user.tipo_user !== "ADMIN") {
        return res.status(403).json({ message: "Acesso restrito a administradores" });
      }

      const pagamentosPendentes = await this.pagamentoPendenteService.getAllPagamentosPendentes();
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res
        .status(500)
        .json({ message: "Erro ao obter pagamentos pendentes", error: error.message });
    }
  }

  async getPagamentoPendenteById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const pagamentoPendente = await this.pagamentoPendenteService.getPagamentoPendenteById(id);

      if (req.user && pagamentoPendente.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      return res.json(pagamentoPendente);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getPagamentosPendentesByUserId(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user?.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesByUserId(user_id);
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosPendentesByStatus(req: Request, res: Response) {
    try {
      // Restringir acesso apenas para admin
      if (!req.user || req.user.tipo_user !== "ADMIN") {
        return res.status(403).json({ message: "Acesso restrito a administradores" });
      }
      const { status } = req.params;
      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesByStatus(status as STATUS);
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getPagamentosPendentesVencidos(req: Request, res: Response) {
    try {
      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesVencidos();
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res
        .status(500)
        .json({ message: "Erro ao obter pagamentos vencidos", error: error.message });
    }
  }

  async getPagamentosPendentesByPeriodo(req: Request, res: Response) {
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

      const pagamentosPendentes =
        await this.pagamentoPendenteService.getPagamentosPendentesByPeriodo(dataInicio, dataFim);
      return res.json(pagamentosPendentes);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async updatePagamentoPendente(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const pendenteExistente = await this.pagamentoPendenteService.getPagamentoPendenteById(id);
      if (req.user && pendenteExistente.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para modificar este recurso" });
      }

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
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async updateStatusPagamentoPendente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Verificar se usuário pode alterar este pendente
      const pendenteExistente = await this.pagamentoPendenteService.getPagamentoPendenteById(id);
      const isAdmin = req.user?.tipo_user === "ADMIN";
      const isOwner = pendenteExistente.user_id === req.user?.id;

      if (!isAdmin && !isOwner) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para alterar este recurso" });
      }

      const pagamentoPendente = await this.pagamentoPendenteService.updateStatusPagamentoPendente(
        id,
        status
      );
      return res.json(pagamentoPendente);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deletePagamentoPendente(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const pendente = await this.pagamentoPendenteService.getPagamentoPendenteById(id);
      if (req.user && pendente.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para deletar este recurso" });
      }

      await this.pagamentoPendenteService.deletePagamentoPendente(id);
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

  async getTotalPagamentosPendentes(req: Request, res: Response) {
    try {
      const total = await this.pagamentoPendenteService.getTotalPagamentosPendentes();
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getTotalPagamentosPendentesByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user?.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      const total = await this.pagamentoPendenteService.getTotalPagamentosPendentesByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }
}
