import { Request, Response } from "express";
import { AssinaturaService } from "../services/AssinaturaService";
import { Logger } from "../utils/Logger";
import { Validators } from "../utils/Validators";

export class AssinaturaController {
  private assinaturaService: AssinaturaService;

  constructor() {
    this.assinaturaService = new AssinaturaService();
  }

  async createAssinatura(req: Request, res: Response) {
    try {
      const { user_id, plano_id } = req.body;

      if (!Validators.isValidUUID(user_id)) {
        return res.status(400).json({ message: "user_id inválido" });
      }

      if (!Validators.isValidUUID(plano_id)) {
        return res.status(400).json({ message: "plano_id inválido" });
      }

      if (req.user && req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para criar recursos para outros usuários" });
      }

      const assinatura = await this.assinaturaService.createAssinatura(user_id, plano_id);
      return res.status(201).json(assinatura);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllAssinaturas(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100 || limit < 1) {
        return res.status(400).json({ message: "Limit deve estar entre 1 e 100" });
      }
      if (offset < 0) {
        return res.status(400).json({ message: "Offset deve ser maior ou igual a 0" });
      }

      const assinaturas = await this.assinaturaService.getAllAssinaturas(limit, offset);
      return res.json(assinaturas);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter assinaturas", error: error.message });
    }
  }

  async getAssinaturaById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const assinatura = await this.assinaturaService.getAssinaturaById(id);

      if (req.user && assinatura.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para acessar este recurso" });
      }
      return res.json(assinatura);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getAssinaturasByUserId(req: Request, res: Response) {
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

      const assinaturas = await this.assinaturaService.getAssinaturasByUserId(user_id);
      return res.json(assinaturas);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(400).json({ message: error.message });
    }
  }

  async updateAssinatura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const assinatura = await this.assinaturaService.getAssinaturaById(id);

      // Admin pode atualizar qualquer assinatura, usuário normal só a sua própria
      const isAdmin = req.user && req.user.tipo_user === "ADMIN";
      if (!isAdmin && req.user && assinatura.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para modificar este recurso" });
      }

      const { plano_id, data_inicio } = req.body;
      const updatedAssinatura = await this.assinaturaService.updateAssinatura(
        id,
        plano_id,
        data_inicio ? new Date(data_inicio) : undefined
      );
      return res.json(updatedAssinatura);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async deleteAssinatura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!Validators.isValidUUID(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const assinatura = await this.assinaturaService.getAssinaturaById(id);
      const isAdmin = req.user?.tipo_user === "ADMIN";
      const isOwner = assinatura.user_id === req.user?.id;

      if (!isAdmin && !isOwner) {
        return res
          .status(403)
          .json({ message: "Você não tem permissão para deletar este recurso" });
      }

      await this.assinaturaService.deleteAssinatura(id);
      return res.status(204).send();
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const statusCode = error.message.includes("não encontrada") ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async cancelarAssinatura(req: Request, res: Response) {
    try {
      const { assinatura_id } = req.params;

      if (!Validators.isValidUUID(assinatura_id)) {
        return res.status(400).json({ message: "assinatura_id inválido" });
      }

      // Nota: Apenas admins podem cancelar (verificado pelo middleware isAdmin na rota)
      const { motivo } = req.body;
      const resultado = await this.assinaturaService.cancelarAssinatura(assinatura_id, motivo);
      return res.status(200).json(resultado);
    } catch (error: any) {
      Logger.error("Erro ao processar requisição", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Usar statusCode do erro se disponível, senão usar 400 como padrão
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }
}
