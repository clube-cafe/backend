import { Request, Response } from "express";
import { AssinaturaService } from "../services/AssinaturaService";
import { Validators } from "../utils/Validators";
import { ValidationError, ForbiddenError } from "../utils/Errors";
import { TIPO_USER } from "../models/enums";

export class AssinaturaController {
  private assinaturaService: AssinaturaService;

  constructor() {
    this.assinaturaService = new AssinaturaService();
  }

  async createAssinatura(req: Request, res: Response) {
    const { user_id, plano_id } = req.body;

    if (!Validators.isValidUUID(user_id)) {
      throw new ValidationError("user_id inválido");
    }
    if (!Validators.isValidUUID(plano_id)) {
      throw new ValidationError("plano_id inválido");
    }
    if (req.user && req.user.id !== user_id) {
      throw new ForbiddenError("Você não tem permissão para criar recursos para outros usuários");
    }

    const resultado = await this.assinaturaService.createAssinatura(user_id, plano_id);

    return res.status(201).json({
      assinatura: resultado.assinatura,
      pagamento: {
        id: resultado.pagamento.id,
        valor: resultado.pagamento.valor,
        data_vencimento: resultado.pagamento.data_vencimento,
        descricao: resultado.pagamento.descricao,
        status: resultado.pagamento.status,
      },
    });
  }

  async getAllAssinaturas(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (limit > 100 || limit < 1) {
      throw new ValidationError("Limit deve estar entre 1 e 100");
    }
    if (offset < 0) {
      throw new ValidationError("Offset deve ser maior ou igual a 0");
    }

    const assinaturas = await this.assinaturaService.getAllAssinaturas(limit, offset);
    return res.json(assinaturas);
  }

  async getAssinaturaById(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const assinatura = await this.assinaturaService.getAssinaturaById(id);

    if (req.user && assinatura.user_id !== req.user.id && req.user.tipo_user !== TIPO_USER.ADMIN) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }
    return res.json(assinatura);
  }

  async getAssinaturasByUserId(req: Request, res: Response) {
    const { userId } = req.params;

    if (!Validators.isValidUUID(userId)) {
      throw new ValidationError("userId inválido");
    }

    const isAdmin = req.user?.tipo_user === TIPO_USER.ADMIN;
    const isOwner = req.user?.id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    const assinaturas = await this.assinaturaService.getAssinaturasByUserId(userId);
    return res.status(200).json(assinaturas);
  }

  async updateAssinatura(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const assinatura = await this.assinaturaService.getAssinaturaById(id);

    const isAdmin = req.user?.tipo_user === TIPO_USER.ADMIN;
    if (!isAdmin && req.user && assinatura.user_id !== req.user.id) {
      throw new ForbiddenError("Você não tem permissão para modificar este recurso");
    }

    const { plano_id, data_inicio } = req.body;
    const updatedAssinatura = await this.assinaturaService.updateAssinatura(
      id,
      plano_id,
      data_inicio ? new Date(data_inicio) : undefined
    );
    return res.json(updatedAssinatura);
  }

  async deleteAssinatura(req: Request, res: Response) {
    const { id } = req.params;

    if (!Validators.isValidUUID(id)) {
      throw new ValidationError("ID inválido");
    }

    const assinatura = await this.assinaturaService.getAssinaturaById(id);
    const isAdmin = req.user?.tipo_user === TIPO_USER.ADMIN;
    const isOwner = assinatura.user_id === req.user?.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Você não tem permissão para deletar este recurso");
    }

    await this.assinaturaService.deleteAssinatura(id);
    return res.status(204).send();
  }

  async cancelarAssinatura(req: Request, res: Response) {
    const { assinatura_id } = req.params;

    if (!Validators.isValidUUID(assinatura_id)) {
      throw new ValidationError("assinatura_id inválido");
    }

    const { motivo } = req.body;
    const resultado = await this.assinaturaService.cancelarAssinatura(assinatura_id, motivo);
    return res.status(200).json(resultado);
  }
}
