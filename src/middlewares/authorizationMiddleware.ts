import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/Errors";
import { Logger } from "../utils/Logger";

/**
 * Middleware para verificar se o usuário autenticado pode acessar recursos de um user_id específico
 * Usuários só podem acessar seus próprios recursos, exceto ADMINs
 */
export const authorizeUserAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedUserId = req.user?.id;

    if (!authenticatedUserId) {
      throw new UnauthorizedError("Usuário não autenticado");
    }

    const targetUserId = req.params.user_id || req.body.user_id;

    if (!targetUserId) {
      return next();
    }

    if (authenticatedUserId !== targetUserId) {
      Logger.warn("Tentativa de acesso não autorizado", {
        authenticatedUserId,
        targetUserId,
        path: req.path,
      });
      throw new ForbiddenError("Você não tem permissão para acessar este recurso");
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    Logger.error("Erro no middleware de autorização", error);
    throw new ForbiddenError("Erro ao verificar permissões");
  }
};

/**
 * Middleware para verificar se o recurso pertence ao usuário autenticado
 * Verifica através de uma função que busca o recurso e retorna o user_id
 */
export const authorizeResourceAccess = (
  getResourceUserId: (resourceId: string) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedUserId = req.user?.id;
      const resourceId = req.params.id || req.params.assinatura_id || req.params.pagamento_id;

      if (!authenticatedUserId) {
        throw new UnauthorizedError("Usuário não autenticado");
      }

      if (!resourceId) {
        return next();
      }

      const resourceUserId = await getResourceUserId(resourceId);

      if (!resourceUserId) {
        return next();
      }

      if (authenticatedUserId !== resourceUserId) {
        Logger.warn("Tentativa de acesso não autorizado a recurso", {
          authenticatedUserId,
          resourceUserId,
          resourceId,
          path: req.path,
        });
        throw new ForbiddenError("Você não tem permissão para acessar este recurso");
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error;
      }
      Logger.error("Erro no middleware de autorização de recurso", error);
      throw new ForbiddenError("Erro ao verificar permissões");
    }
  };
};
