/**
 * Erros customizados para melhor controle e padronização
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} não encontrado(a)`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Não autorizado") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Erro interno do servidor") {
    super(500, message);
    this.name = "InternalServerError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Acesso negado") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}
