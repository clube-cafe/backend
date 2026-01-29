import { Request, Response } from "express";
import { HistoricoService } from "../services/HistoricoService";
import { TIPO } from "../models/enums";
import { Logger } from "../utils/Logger";
import { Validators } from "../utils/Validators";

export class HistoricoController {
  private historicoService: HistoricoService;

  constructor() {
    this.historicoService = new HistoricoService();
  }

  async createHistorico(req: Request, res: Response) {
    try {
      const { user_id, tipo, valor, data, descricao } = req.body;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para criar recursos para outros usuários" });
      }

      const historico = await this.historicoService.createHistorico(
        user_id,
        tipo,
        valor,
        new Date(data),
        descricao
      );
      return res.status(201).json(historico);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllHistoricos(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100 || limit < 1) {
        return res.status(400).json({ message: "Limit deve estar entre 1 e 100" });
      }
      if (offset < 0) {
        return res.status(400).json({ message: "Offset deve ser maior ou igual a 0" });
      }

      const historicos = await this.historicoService.getAllHistoricos(limit, offset);
      return res.json(historicos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter históricos", error: error.message });
    }
  }

  async getHistoricoById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const historico = await this.historicoService.getHistoricoById(id);

      if (req.user && historico.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      return res.json(historico);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getHistoricosByUserId(req: Request, res: Response) {
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

      const historicos = await this.historicoService.getHistoricosByUserId(user_id);
      return res.json(historicos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getHistoricosByTipo(req: Request, res: Response) {
    try {
      const { tipo } = req.params;
      const historicos = await this.historicoService.getHistoricosByTipo(tipo as TIPO);
      return res.json(historicos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getHistoricosByPeriodo(req: Request, res: Response) {
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

      const historicos = await this.historicoService.getHistoricosByPeriodo(dataInicio, dataFim);
      return res.json(historicos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getHistoricosByUserIdAndPeriodo(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const { data_inicio, data_fim } = req.query;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (req.user?.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }

      if (!data_inicio || !data_fim) {
        return res.status(400).json({ message: "data_inicio e data_fim são obrigatórios" });
      }

      const dataInicio = new Date(data_inicio as string);
      const dataFim = new Date(data_fim as string);

      if (!Validators.isValidDate(dataInicio) || !Validators.isValidDate(dataFim)) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      const historicos = await this.historicoService.getHistoricosByUserIdAndPeriodo(
        user_id,
        dataInicio,
        dataFim
      );
      return res.json(historicos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async updateHistorico(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const historicoExistente = await this.historicoService.getHistoricoById(id);
      if (req.user && historicoExistente.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para modificar este recurso" });
      }

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
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrado") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deleteHistorico(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const historico = await this.historicoService.getHistoricoById(id);
      if (req.user && historico.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para deletar este recurso" });
      }

      await this.historicoService.deleteHistorico(id);
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

  async getTotalEntradas(req: Request, res: Response) {
    try {
      const total = await this.historicoService.getTotalEntradas();
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getTotalSaidas(req: Request, res: Response) {
    try {
      const total = await this.historicoService.getTotalSaidas();
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao calcular total", error: error.message });
    }
  }

  async getSaldoAtual(req: Request, res: Response) {
    try {
      const saldo = await this.historicoService.getSaldoAtual();
      return res.json({ saldo });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao calcular saldo", error: error.message });
    }
  }

  async getTotalEntradasByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const total = await this.historicoService.getTotalEntradasByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getTotalSaidasByUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const total = await this.historicoService.getTotalSaidasByUser(user_id);
      return res.json({ total });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getSaldoAtualByUser(req: Request, res: Response) {
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

      const saldo = await this.historicoService.getSaldoAtualByUser(user_id);
      return res.json({ saldo });
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }
}
