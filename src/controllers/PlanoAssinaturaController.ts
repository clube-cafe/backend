import { Request, Response } from "express";
import { PlanoAssinaturaService } from "../services/PlanoAssinaturaService";
import { Validators } from "../utils/Validators";
import { ValidationError } from "../utils/Errors";

export class PlanoAssinaturaController {
  private planoService: PlanoAssinaturaService;

  constructor() {
    this.planoService = new PlanoAssinaturaService();
  }

  async createPlano(req: Request, res: Response) {
    const { nome, descricao, valor, periodicidade } = req.body;
    const plano = await this.planoService.createPlano(nome, descricao, valor, periodicidade);
    return res.status(201).json(plano);
  }

  async getAllPlanos(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const apenasAtivos = req.query.apenasAtivos !== "false";

    if (limit > 100 || limit < 1) {
      throw new ValidationError("Limit deve estar entre 1 e 100");
    }
    if (offset < 0) {
      throw new ValidationError("Offset deve ser maior ou igual a 0");
    }

    const planos = await this.planoService.getAllPlanos(limit, offset, apenasAtivos);
    return res.json(planos);
  }

  async getPlanoById(req: Request, res: Response) {
    const { id } = req.params;
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }
    const plano = await this.planoService.getPlanoById(id);
    return res.json(plano);
  }

  async updatePlano(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, descricao, valor, periodicidade, ativo } = req.body;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
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
  }

  async deletePlano(req: Request, res: Response) {
    const { id } = req.params;
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }
    await this.planoService.deletePlano(id);
    return res.status(204).send();
  }
}

export const planoAssinaturaController = new PlanoAssinaturaController();
