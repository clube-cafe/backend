import { Request, Response } from "express";
import { HistoricoService } from "../services/HistoricoService";
import { TIPO, TIPO_USER } from "../models/enums";
import { Validators } from "../utils/Validators";
import { ValidationError, ForbiddenError } from "../utils/Errors";

export class HistoricoController {
  private historicoService: HistoricoService;

  constructor() {
    this.historicoService = new HistoricoService();
  }

  async createHistorico(req: Request, res: Response) {
    const { user_id, tipo, valor, data, descricao } = req.body;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user && req.user.id !== user_id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para criar recursos para outros usuários");
    }

    const historico = await this.historicoService.createHistorico(
      user_id,
      tipo,
      valor,
      new Date(data),
      descricao
    );
    return res.status(201).json(historico);
  }

  async getAllHistoricos(req: Request, res: Response) {
    if (req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (limit > 100 || limit < 1) {
      throw new ValidationError("Limit deve estar entre 1 e 100");
    }
    if (offset < 0) {
      throw new ValidationError("Offset deve ser maior ou igual a 0");
    }

    const historicos = await this.historicoService.getAllHistoricos(limit, offset);
    return res.json(historicos);
  }

  async getHistoricoById(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const historico = await this.historicoService.getHistoricoById(id);

    if (req.user && historico.user_id !== req.user.id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    return res.json(historico);
  }

  async getHistoricosByUserId(req: Request, res: Response) {
    const { user_id } = req.params;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user?.id !== user_id && req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    const historicos = await this.historicoService.getHistoricosByUserId(user_id);
    return res.json(historicos);
  }

  async getHistoricosByTipo(req: Request, res: Response) {
    if (req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const { tipo } = req.params;
    const historicos = await this.historicoService.getHistoricosByTipo(tipo as TIPO);
    return res.json(historicos);
  }

  async getHistoricosByPeriodo(req: Request, res: Response) {
    if (req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      throw new ValidationError("data_inicio e data_fim são obrigatórios");
    }

    const dataInicio = new Date(data_inicio as string);
    const dataFim = new Date(data_fim as string);

    if (!Validators.isValidDate(dataInicio) || !Validators.isValidDate(dataFim)) {
      throw new ValidationError("Datas inválidas");
    }

    const historicos = await this.historicoService.getHistoricosByPeriodo(dataInicio, dataFim);
    return res.json(historicos);
  }

  async getHistoricosByUserIdAndPeriodo(req: Request, res: Response) {
    const { user_id } = req.params;
    const { data_inicio, data_fim } = req.query;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user?.id !== user_id && req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }
    if (!data_inicio || !data_fim) {
      throw new ValidationError("data_inicio e data_fim são obrigatórios");
    }

    const dataInicio = new Date(data_inicio as string);
    const dataFim = new Date(data_fim as string);

    if (!Validators.isValidDate(dataInicio) || !Validators.isValidDate(dataFim)) {
      throw new ValidationError("Datas inválidas");
    }

    const historicos = await this.historicoService.getHistoricosByUserIdAndPeriodo(
      user_id,
      dataInicio,
      dataFim
    );
    return res.json(historicos);
  }

  async updateHistorico(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const historicoExistente = await this.historicoService.getHistoricoById(id);
    if (
      req.user &&
      historicoExistente.user_id !== req.user.id &&
      req.user.tipo_user !== TIPO_USER.ADMIN
    ) {
      throw new ForbiddenError("Você não tem permissão para modificar este recurso");
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
  }

  async deleteHistorico(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const historico = await this.historicoService.getHistoricoById(id);
    if (req.user && historico.user_id !== req.user.id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para deletar este recurso");
    }

    await this.historicoService.deleteHistorico(id);
    return res.status(204).send();
  }

  async getTotalEntradas(req: Request, res: Response) {
    const total = await this.historicoService.getTotalEntradas();
    return res.json({ total });
  }

  async getTotalSaidas(req: Request, res: Response) {
    const total = await this.historicoService.getTotalSaidas();
    return res.json({ total });
  }

  async getSaldoAtual(req: Request, res: Response) {
    const saldo = await this.historicoService.getSaldoAtual();
    return res.json({ saldo });
  }

  async getTotalEntradasByUser(req: Request, res: Response) {
    const { user_id } = req.params;
    const total = await this.historicoService.getTotalEntradasByUser(user_id);
    return res.json({ total });
  }

  async getTotalSaidasByUser(req: Request, res: Response) {
    const { user_id } = req.params;
    const total = await this.historicoService.getTotalSaidasByUser(user_id);
    return res.json({ total });
  }

  async getSaldoAtualByUser(req: Request, res: Response) {
    const { user_id } = req.params;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user?.id !== user_id && req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    const saldo = await this.historicoService.getSaldoAtualByUser(user_id);
    return res.json({ saldo });
  }
}
