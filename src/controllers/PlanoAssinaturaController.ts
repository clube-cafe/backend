import { Request, Response } from "express";
import { PlanoAssinaturaService } from "../services/PlanoAssinaturaService";
import { Logger } from "../utils/Logger";
import { Validators } from "../utils/Validators";

export class PlanoAssinaturaController {
  private planoService: PlanoAssinaturaService;

  constructor() {
    this.planoService = new PlanoAssinaturaService();
  }

  async createPlano(req: Request, res: Response) {
    try {
      const { nome, descricao, valor, periodicidade } = req.body;

      const plano = await this.planoService.createPlano(nome, descricao, valor, periodicidade);
      return res.status(201).json(plano);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllPlanos(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const apenasAtivos = req.query.apenasAtivos !== "false"; // default true

      if (limit > 100 || limit < 1) {
        return res.status(400).json({ message: "Limit deve estar entre 1 e 100" });
      }
      if (offset < 0) {
        return res.status(400).json({ message: "Offset deve ser maior ou igual a 0" });
      }

      const planos = await this.planoService.getAllPlanos(limit, offset, apenasAtivos);
      return res.json(planos);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter planos", error: error.message });
    }
  }

  async getPlanoById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const plano = await this.planoService.getPlanoById(id);
      return res.json(plano);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error.statusCode === 404) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao obter plano", error: error.message });
    }
  }

  async updatePlano(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, descricao, valor, periodicidade, ativo } = req.body;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const plano = await this.planoService.updatePlano(
        id,
        nome,
        descricao,
        valor,
        periodicidade,
        ativo
      );
      return res.json(plano);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error.statusCode === 404) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  async deletePlano(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await this.planoService.deletePlano(id);
      return res.status(204).send();
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error.statusCode === 404) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao deletar plano", error: error.message });
    }
  }
}

export const planoAssinaturaController = new PlanoAssinaturaController();
