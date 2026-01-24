import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/Errors";
import { Logger } from "../utils/Logger";

/**
 * Middleware centralizado para tratamento de erros
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  Logger.error("Erro não tratado", { message: err.message, stack: err.stack });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  return res.status(500).json({
    error: "InternalServerError",
    message: "Erro interno do servidor",
    statusCode: 500,
  });
}

/**
 * Middleware para validar Content-Type
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Content-Type deve ser application/json",
      });
    }
  }
  next();
}

/**
 * Middleware para rate limiting básico (opcional)
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    Logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}
