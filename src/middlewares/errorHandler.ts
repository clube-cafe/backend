import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/Errors";
import { Logger } from "../utils/Logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      Logger.error("Erro na aplicação", { message: err.message, stack: err.stack });
    }
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  Logger.error("Erro não tratado", { message: err.message, stack: err.stack });
  res.status(500).json({
    error: "InternalServerError",
    message: "Erro interno do servidor",
    statusCode: 500,
  });
}

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

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    Logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}
