import { Request, Response } from "express";
import { PagamentoService } from "../services/PagamentoService";
import { PAGAMENTO_ENUM, STATUS, TIPO_USER } from "../models/enums";
import { Validators } from "../utils/Validators";
import { ValidationError, ForbiddenError } from "../utils/Errors";

export class PagamentoController {
  private pagamentoService: PagamentoService;

  constructor() {
    this.pagamentoService = new PagamentoService();
  }

  async createPagamento(req: Request, res: Response) {
    const { user_id, valor, data_vencimento, descricao, status } = req.body;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user && req.user.id !== user_id) {
      throw new ForbiddenError("Você não tem permissão para criar recursos para outros usuários");
    }

    const pagamento = await this.pagamentoService.createPagamento(
      user_id,
      valor,
      new Date(data_vencimento),
      descricao,
      status
    );
    return res.status(201).json(pagamento);
  }

  async getAllPagamentos(req: Request, res: Response) {
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

    const pagamentos = await this.pagamentoService.getAllPagamentos(limit, offset);
    return res.json(pagamentos);
  }

  async getPagamentoById(req: Request, res: Response) {
    const { id } = req.params;
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }
    const pagamento = await this.pagamentoService.getPagamentoById(id);
    return res.json(pagamento);
  }

  async getPagamentosByUserId(req: Request, res: Response) {
    const { user_id } = req.params;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user && req.user.id !== user_id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    const pagamentos = await this.pagamentoService.getPagamentosByUserId(user_id);
    return res.json(pagamentos);
  }

  async getPagamentosByStatus(req: Request, res: Response) {
    if (req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Acesso restrito a administradores");
    }
    const { status } = req.params;
    const pagamentos = await this.pagamentoService.getPagamentosByStatus(status as STATUS);
    return res.json(pagamentos);
  }

  async getPagamentosByForma(req: Request, res: Response) {
    const { forma_pagamento } = req.params;
    const pagamentos = await this.pagamentoService.getPagamentosByForma(
      forma_pagamento as PAGAMENTO_ENUM
    );
    return res.json(pagamentos);
  }

  async getPagamentosByDateRange(req: Request, res: Response) {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      throw new ValidationError("data_inicio e data_fim são obrigatórios");
    }

    const dataInicio = new Date(data_inicio as string);
    const dataFim = new Date(data_fim as string);

    if (!Validators.isValidDate(dataInicio) || !Validators.isValidDate(dataFim)) {
      throw new ValidationError("Datas inválidas");
    }

    const pagamentos = await this.pagamentoService.getPagamentosByDateRange(dataInicio, dataFim);
    return res.json(pagamentos);
  }

  async getPagamentosVencidos(req: Request, res: Response) {
    const pagamentos = await this.pagamentoService.getPagamentosVencidos();
    return res.json(pagamentos);
  }

  async getPagamentosByVencimentoPeriodo(req: Request, res: Response) {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      throw new ValidationError("data_inicio e data_fim são obrigatórios");
    }

    const dataInicio = new Date(data_inicio as string);
    const dataFim = new Date(data_fim as string);

    if (!Validators.isValidDate(dataInicio) || !Validators.isValidDate(dataFim)) {
      throw new ValidationError("Datas inválidas");
    }

    const pagamentos = await this.pagamentoService.getPagamentosByVencimentoPeriodo(
      dataInicio,
      dataFim
    );
    return res.json(pagamentos);
  }

  async getPagamentosPendentes(req: Request, res: Response) {
    if (req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    const pagamentos = await this.pagamentoService.getPagamentosPendentes();
    return res.json(pagamentos);
  }

  async updatePagamento(req: Request, res: Response) {
    const { id } = req.params;
    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const pagamentoExistente = await this.pagamentoService.getPagamentoById(id);
    if (
      req.user &&
      pagamentoExistente.user_id !== req.user.id &&
      req.user.tipo_user !== TIPO_USER.ADMIN
    ) {
      throw new ForbiddenError("Você não tem permissão para modificar este recurso");
    }

    const { valor, data_vencimento, descricao, status, observacao } = req.body;

    const updatedPagamento = await this.pagamentoService.updatePagamento(
      id,
      valor,
      data_vencimento ? new Date(data_vencimento) : undefined,
      descricao,
      status,
      observacao
    );
    return res.json(updatedPagamento);
  }

  async updateStatusPagamento(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const pagamentoExistente = await this.pagamentoService.getPagamentoById(id);
    const isAdmin = req.user?.tipo_user === TIPO_USER.ADMIN;
    const isOwner = pagamentoExistente.user_id === req.user?.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Você não tem permissão para alterar este recurso");
    }

    const pagamento = await this.pagamentoService.updateStatusPagamento(id, status);
    return res.json(pagamento);
  }

  async registrarPagamentoCompleto(req: Request, res: Response) {
    const { pagamento_id, forma_pagamento, observacao } = req.body;

    if (!Validators.isValidUUID(pagamento_id)) {
      throw new ValidationError("pagamento_id inválido");
    }

    const resultado = await this.pagamentoService.registrarPagamentoCompleto(
      pagamento_id,
      forma_pagamento,
      observacao
    );
    return res.status(201).json({ message: "Pagamento registrado com sucesso", ...resultado });
  }

  async deletePagamento(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const pagamento = await this.pagamentoService.getPagamentoById(id);
    if (req.user && pagamento.user_id !== req.user.id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para deletar este recurso");
    }

    await this.pagamentoService.deletePagamento(id);
    return res.status(204).send();
  }

  async getTotalPagamentos(req: Request, res: Response) {
    const total = await this.pagamentoService.getTotalPagamentos();
    return res.json({ total });
  }

  async getTotalPagamentosByUser(req: Request, res: Response) {
    const { user_id } = req.params;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user && req.user.id !== user_id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    const total = await this.pagamentoService.getTotalPagamentosByUser(user_id);
    return res.json({ total });
  }

  async getTotalPagamentosPendentes(req: Request, res: Response) {
    const total = await this.pagamentoService.getTotalPagamentosPendentes();
    return res.json({ total });
  }

  async getTotalPagamentosPendentesByUser(req: Request, res: Response) {
    const { user_id } = req.params;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (req.user?.id !== user_id && req.user?.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    const total = await this.pagamentoService.getTotalPagamentosPendentesByUser(user_id);
    return res.json({ total });
  }
}
